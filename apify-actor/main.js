import { Actor } from "apify";
import { ApifyClient } from "apify-client";

const DEFAULT_MODELS = [
  "T1", "T2", "T5", "T7", "T9", "T10", "T11", "T20", "T30", "T33",
  "T50", "T70", "T77", "T90", "T100", "T200", "T300", "T500", "T700", "T900",
  "TX1", "TX5", "TX7", "TX9", "TX10", "TX20", "TX30", "TX55", "TX66", "TX100V", "TX200V", "TX300V"
];

const MIN_PRICE_USD = 80;
const SOLD_SEARCH_LIMIT_PER_QUERY = 1000;
const DATASET_READ_LIMIT = 10000;
const DEFAULT_SOLD_SCRAPER_ACTOR_ID = "automation-lab/ebay-sold-scraper";
const EXCLUDED_TITLE_WORDS = [
  "box only",
  "parts",
  "repair",
  "broken",
  "not working",
  "untested",
  "junk",
  "as-is",
  "as is"
];

await Actor.main(async () => {
  const input = (await Actor.getInput()) ?? {};
  const supabaseUrl = normalizeSupabaseUrl(input.supabaseUrl || process.env.SUPABASE_URL);
  const serviceRoleKey = input.supabaseServiceRoleKey || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const apifyToken = input.apifyToken || process.env.APIFY_TOKEN;
  const soldScraperActorId = input.soldScraperActorId || DEFAULT_SOLD_SCRAPER_ACTOR_ID;
  const models = cleanModels(input.models?.length ? input.models : DEFAULT_MODELS);
  const delayMs = clamp(Number(input.delayMs || 1500), 500, 10000);

  if (!supabaseUrl) throw new Error("Supabase URL is missing.");
  if (!serviceRoleKey) throw new Error("Supabase service role key is missing. Store it only in Apify, not in browser files.");
  if (!apifyToken) throw new Error("Apify token is missing. Add it to the Apify token input if nested Actor calls fail.");

  const client = new ApifyClient({ token: apifyToken });
  const run = await createRefreshRun(supabaseUrl, serviceRoleKey, {
    status: "running",
    models_count: models.length,
    note: `Started eBay sold update for ${models.length} models via ${soldScraperActorId}.`
  });

  let updatedModels = 0;
  let totalItems = 0;
  const results = [];

  try {
    for (const model of models) {
      logInfo(`Updating ${model}`);
      const result = await updateModel({
        model,
        client,
        soldScraperActorId,
        supabaseUrl,
        serviceRoleKey
      });

      results.push(result);
      if (result.status === "updated") {
        updatedModels += 1;
        totalItems += result.soldItems;
      }

      await Actor.pushData(result);
      await sleep(delayMs);
    }

    await finishRefreshRun(supabaseUrl, serviceRoleKey, run?.id, {
      status: "success",
      finished_at: new Date().toISOString(),
      models_count: updatedModels,
      items_count: totalItems,
      note: `Updated ${updatedModels}/${models.length} models from ${totalItems} sold items.`
    });
  } catch (error) {
    await finishRefreshRun(supabaseUrl, serviceRoleKey, run?.id, {
      status: "error",
      finished_at: new Date().toISOString(),
      models_count: updatedModels,
      items_count: totalItems,
      note: String(error.message || error)
    });
    throw error;
  }

  await Actor.setValue("OUTPUT", {
    updatedModels,
    totalItems,
    results
  });
});

async function updateModel({ model, client, soldScraperActorId, supabaseUrl, serviceRoleKey }) {
  try {
    const rawItems = await runSoldScraper({
      client,
      actorId: soldScraperActorId,
      model
    });

    const soldItems = dedupeByUrl(rawItems.map((item) => normalizeSoldItem(item)))
      .filter((item) => item.title && titleMatchesModel(item.title, model))
      .filter((item) => isValidCameraTitle(item.title))
      .filter((item) => Number.isFinite(item.priceUsd) && item.priceUsd >= MIN_PRICE_USD);

    if (soldItems.length < 3) {
      return {
        model,
        status: "skipped",
        reason: `Only ${soldItems.length} valid sold items returned by ${soldScraperActorId}.`,
        soldItems: soldItems.length,
        searchKeywords: ebayKeywords(model)
      };
    }

    const prices = soldItems.map((item) => item.totalUsd);
    const shippingPrices = soldItems.map((item) => item.shippingUsd).filter((value) => Number.isFinite(value) && value >= 0);
    const metrics = buildMetrics({
      model,
      prices,
      shippingPrices,
      soldItems
    });

    await upsertMetric(supabaseUrl, serviceRoleKey, metrics);
    await insertSnapshots(supabaseUrl, serviceRoleKey, model, soldItems.slice(0, 20));

    return {
      model,
      status: "updated",
      avgUsd: metrics.avg_usd,
      lowUsd: metrics.low_usd,
      highUsd: metrics.high_usd,
      priceBasis: "buyer_total_price",
      rank: metrics.rank,
      soldItems: soldItems.length,
      searchKeywords: ebayKeywords(model),
      sourceActor: soldScraperActorId
    };
  } catch (error) {
    logWarning(`${model} failed: ${error.message}`);
    return {
      model,
      status: "error",
      reason: String(error.message || error),
      sourceActor: soldScraperActorId
    };
  }
}

async function runSoldScraper({ client, actorId, model }) {
  const searchQueries = ebayKeywords(model);
  const input = {
    searchQueries,
    maxListingsPerSearch: SOLD_SEARCH_LIMIT_PER_QUERY,
    minPrice: MIN_PRICE_USD
  };

  logInfo(`Calling ${actorId} with ${searchQueries.join(" | ")}`);
  const run = await client.actor(actorId).call(input);
  const datasetId = run.defaultDatasetId;
  if (!datasetId) return [];

  const { items } = await client.dataset(datasetId).listItems({
    clean: true,
    limit: DATASET_READ_LIMIT
  });

  return items || [];
}

function buildMetrics({ model, prices, shippingPrices, soldItems }) {
  const sorted = [...prices].sort((a, b) => a - b);
  const avgUsd = round2(average(prices));
  const lowUsd = round2(percentile(sorted, 0.10));
  const highUsd = round2(percentile(sorted, 0.90));
  const avgShippingUsd = round2(shippingPrices.length ? average(shippingPrices) : 0);
  const listings = soldItems.length;
  const reliability = soldItems.length >= 30 ? "High" : soldItems.length >= 10 ? "Medium" : "Low";
  const rank = chooseRank({ soldItemsCount: soldItems.length, avgUsd });

  return {
    model,
    series: model.startsWith("TX") ? "TX" : "T",
    avg_usd: avgUsd,
    low_usd: lowUsd,
    high_usd: highUsd,
    avg_shipping_usd: avgShippingUsd,
    sell_through: 0,
    listings,
    reliability,
    rank,
    source: "apify_store_ebay_sold",
    updated_at: new Date().toISOString()
  };
}

function chooseRank({ soldItemsCount, avgUsd }) {
  if (soldItemsCount >= 60 && avgUsd >= 130) return "S";
  if (soldItemsCount >= 30) return "A";
  if (soldItemsCount >= 10) return "B";
  if (soldItemsCount >= 3) return "C";
  return "D";
}

function ebayKeywords(model) {
  const dscModel = `DSC-${model}`;
  return [
    `SONY Cyber-shot ${model}`,
    `SONY ${model}`,
    `Cyber-shot ${model}`,
    `SONY Cyber-shot ${dscModel}`,
    `SONY ${dscModel}`,
    dscModel
  ];
}

function normalizeSoldItem(item) {
  const title = pickString(item, ["title", "name", "itemTitle"]);
  const priceUsd = pickNumber(item, ["price", "soldPrice", "priceUsd", "itemPrice", "currentPrice"]);
  const shippingUsd = pickNumber(item, ["shipping", "shippingPrice", "shippingUsd", "shippingCost"], 0);
  const totalUsd = round2(priceUsd + shippingUsd);
  const itemUrl = pickString(item, ["url", "itemUrl", "link", "itemLink"]);
  const soldAt = pickDate(item, ["soldDate", "soldAt", "dateSold", "endedAt"]);
  const condition = pickString(item, ["condition", "itemCondition"]);

  return {
    title,
    priceUsd,
    shippingUsd,
    totalUsd,
    itemUrl,
    soldAt,
    condition
  };
}

function pickString(item, keys) {
  for (const key of keys) {
    const value = item?.[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function pickNumber(item, keys, fallback = NaN) {
  for (const key of keys) {
    const value = item?.[key];
    const parsed = parseUsd(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function pickDate(item, keys) {
  for (const key of keys) {
    const value = item?.[key];
    if (!value) continue;
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date.toISOString();
  }
  return null;
}

function isValidCameraTitle(title) {
  const normalized = normalizeTitle(title);
  if (!normalized) return false;
  if (!normalized.includes("sony")) return false;
  if (EXCLUDED_TITLE_WORDS.some((word) => normalized.includes(word))) return false;
  return true;
}

function titleMatchesModel(title, model) {
  const normalized = normalizeTitle(title);
  const strictModel = model.toLowerCase();
  const compactTitle = normalized.replace(/[^a-z0-9]/g, "");
  const variants = [
    `dsc${strictModel}`,
    `dsct${strictModel.replace(/^t/, "")}`,
    `cybershot${strictModel}`,
    strictModel
  ].map((value) => value.replace(/[^a-z0-9]/g, ""));
  return variants.some((variant) => compactTitle.includes(variant));
}

function parseUsd(value) {
  if (typeof value === "number") return value;
  if (value && typeof value === "object") {
    return parseUsd(value.value ?? value.amount ?? value.price);
  }
  const normalized = String(value || "").replace(/,/g, "");
  const match = normalized.match(/\$?\s*(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : NaN;
}

function cleanText(text) {
  return String(text || "").replace(/\s+/g, " ").trim();
}

function normalizeTitle(title) {
  return cleanText(title).toLowerCase().replace(/[‐‑‒–—―]/g, "-").replace(/[_/]+/g, " ");
}

function dedupeByUrl(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = item.itemUrl || `${item.title}-${item.priceUsd}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function upsertMetric(supabaseUrl, serviceRoleKey, metric) {
  const response = await fetch(`${supabaseUrl}/rest/v1/model_market_metrics?on_conflict=model`, {
    method: "POST",
    headers: supabaseHeaders(serviceRoleKey, {
      "Prefer": "resolution=merge-duplicates"
    }),
    body: JSON.stringify(metric)
  });

  if (!response.ok) {
    throw new Error(`Supabase metric upsert failed: ${response.status} ${await response.text()}`);
  }
}

async function insertSnapshots(supabaseUrl, serviceRoleKey, model, items) {
  if (!items.length) return;
  const rows = items.map((item) => ({
    model,
    sold_at: item.soldAt,
    title: item.title,
    price_usd: item.totalUsd,
    shipping_usd: item.shippingUsd,
    condition: item.condition,
    item_url: item.itemUrl,
    source: "apify_store_ebay_sold",
    captured_at: new Date().toISOString()
  }));

  const response = await fetch(`${supabaseUrl}/rest/v1/market_snapshots`, {
    method: "POST",
    headers: supabaseHeaders(serviceRoleKey),
    body: JSON.stringify(rows)
  });

  if (!response.ok) {
    logWarning(`Snapshot insert failed for ${model}: ${response.status} ${await response.text()}`);
  }
}

async function createRefreshRun(supabaseUrl, serviceRoleKey, row) {
  const response = await fetch(`${supabaseUrl}/rest/v1/refresh_runs?select=id`, {
    method: "POST",
    headers: supabaseHeaders(serviceRoleKey, {
      Prefer: "return=representation"
    }),
    body: JSON.stringify({
      provider: "apify",
      ...row,
      started_at: new Date().toISOString()
    })
  });

  if (!response.ok) {
    logWarning(`Refresh run create failed: ${response.status} ${await response.text()}`);
    return null;
  }

  const text = await response.text();
  if (!text) return null;
  const rows = JSON.parse(text);
  return rows[0] || null;
}

async function finishRefreshRun(supabaseUrl, serviceRoleKey, id, row) {
  if (!id) return;
  const response = await fetch(`${supabaseUrl}/rest/v1/refresh_runs?id=eq.${id}`, {
    method: "PATCH",
    headers: supabaseHeaders(serviceRoleKey),
    body: JSON.stringify(row)
  });

  if (!response.ok) {
    logWarning(`Refresh run finish failed: ${response.status} ${await response.text()}`);
  }
}

function supabaseHeaders(serviceRoleKey, extra = {}) {
  return {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    "Content-Type": "application/json",
    ...extra
  };
}

function logInfo(message) {
  console.log(`INFO ${message}`);
}

function logWarning(message) {
  console.warn(`WARN ${message}`);
}

function normalizeSupabaseUrl(value) {
  return String(value || "").trim().replace(/\/$/, "");
}

function cleanModels(models) {
  return [...new Set(models.map((model) => String(model).trim().toUpperCase()).filter(Boolean))];
}

function average(values) {
  return values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length);
}

function percentile(sorted, p) {
  if (!sorted.length) return 0;
  const index = (sorted.length - 1) * p;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
}

function round2(value) {
  return Math.round(Number(value || 0) * 100) / 100;
}

function round4(value) {
  return Math.round(Number(value || 0) * 10000) / 10000;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
