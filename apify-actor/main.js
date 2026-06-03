import { Actor } from "apify";
import { gotScraping } from "crawlee";
import * as cheerio from "cheerio";

const DEFAULT_MODELS = [
  "T1", "T2", "T5", "T7", "T9", "T10", "T11", "T20", "T30", "T33",
  "T50", "T70", "T77", "T90", "T100", "T200", "T300", "T500", "T700", "T900",
  "TX1", "TX5", "TX7", "TX9", "TX10", "TX20", "TX30", "TX55", "TX66", "TX100V", "TX200V", "TX300V"
];

const RANKS = [
  { rank: "S", minSellThrough: 0.30, minListings: 20 },
  { rank: "A", minSellThrough: 0.15, minListings: 20 },
  { rank: "B", minSellThrough: 0.08, minListings: 15 },
  { rank: "C", minSellThrough: 0.03, minListings: 8 },
  { rank: "D", minSellThrough: 0, minListings: 0 }
];

const USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36";
const DIGITAL_CAMERAS_CATEGORY_ID = "31388";
const MIN_PRICE_USD = 80;
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
  const models = cleanModels(input.models?.length ? input.models : DEFAULT_MODELS);
  const maxSoldItemsPerModel = clamp(Number(input.maxSoldItemsPerModel || 30), 10, 100);
  const delayMs = clamp(Number(input.delayMs || 1500), 500, 10000);
  const proxyConfiguration = input.useApifyProxy === false
    ? null
    : await Actor.createProxyConfiguration({
      groups: input.proxyGroups?.length ? input.proxyGroups : undefined
    });

  if (!supabaseUrl) throw new Error("Supabase URL is missing.");
  if (!serviceRoleKey) throw new Error("Supabase service role key is missing. Store it only in Apify, not in browser files.");

  const run = await createRefreshRun(supabaseUrl, serviceRoleKey, {
    status: "running",
    models_count: models.length,
    note: `Started eBay update for ${models.length} models.`
  });

  let updatedModels = 0;
  let totalItems = 0;
  const results = [];

  try {
    for (const model of models) {
      logInfo(`Updating ${model}`);
      const result = await updateModel({ model, maxSoldItemsPerModel, supabaseUrl, serviceRoleKey, proxyConfiguration });
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

async function updateModel({ model, maxSoldItemsPerModel, supabaseUrl, serviceRoleKey, proxyConfiguration }) {
  try {
    const soldPages = await fetchEbaySearchPages(model, { sold: true, proxyConfiguration });
    const activePages = await fetchEbaySearchPages(model, { sold: false, proxyConfiguration });

    const soldItems = dedupeByUrl(soldPages.flatMap((page) => parseSoldItems(page.html, model))).slice(0, maxSoldItemsPerModel);
    const activeCount = Math.max(0, ...activePages.map((page) => parseResultCount(page.html)));
    const soldCountFromHeading = Math.max(0, ...soldPages.map((page) => parseResultCount(page.html)));
    const soldCount = soldCountFromHeading || soldItems.length;

    if (soldItems.length < 3) {
      return {
        model,
        status: "skipped",
        reason: `Only ${soldItems.length} sold items parsed.`,
        activeCount,
        soldCount
      };
    }

    const prices = soldItems.map((item) => item.priceUsd).filter((value) => Number.isFinite(value) && value > 0);
    const shippingPrices = soldItems.map((item) => item.shippingUsd).filter((value) => Number.isFinite(value) && value >= 0);
    const metrics = buildMetrics({
      model,
      prices,
      shippingPrices,
      activeCount,
      soldCount,
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
      sellThrough: metrics.sell_through,
      rank: metrics.rank,
      activeCount,
      soldItems: soldItems.length,
      searchKeywords: ebayKeywords(model)
    };
  } catch (error) {
    logWarning(`${model} failed: ${error.message}`);
    return {
      model,
      status: "error",
      reason: String(error.message || error)
    };
  }
}

function buildMetrics({ model, prices, shippingPrices, activeCount, soldCount, soldItems }) {
  const sorted = [...prices].sort((a, b) => a - b);
  const avgUsd = round2(average(prices));
  const lowUsd = round2(percentile(sorted, 0.10));
  const highUsd = round2(percentile(sorted, 0.90));
  const avgShippingUsd = round2(shippingPrices.length ? average(shippingPrices) : 0);
  const listings = activeCount || soldItems.length;
  const sellThrough = round4(soldCount / Math.max(1, soldCount + listings));
  const reliability = soldItems.length >= 20 ? "High" : soldItems.length >= 10 ? "Medium" : "Low";
  const rank = chooseRank({ sellThrough, listings });

  return {
    model,
    series: model.startsWith("TX") ? "TX" : "T",
    avg_usd: avgUsd,
    low_usd: lowUsd,
    high_usd: highUsd,
    avg_shipping_usd: avgShippingUsd,
    sell_through: sellThrough,
    listings,
    reliability,
    rank,
    source: "apify_ebay_sold",
    updated_at: new Date().toISOString()
  };
}

function chooseRank({ sellThrough, listings }) {
  return RANKS.find((rule) => sellThrough >= rule.minSellThrough && listings >= rule.minListings)?.rank || "D";
}

async function fetchEbaySearchPage(model, { sold, proxyConfiguration }) {
  const search = new URL("https://www.ebay.com/sch/i.html");
  search.searchParams.set("_nkw", ebayKeywords(model)[0]);
  search.searchParams.set("_sacat", DIGITAL_CAMERAS_CATEGORY_ID);
  search.searchParams.set("_ipg", "100");
  search.searchParams.set("rt", "nc");
  search.searchParams.set("LH_PrefLoc", "2");
  search.searchParams.set("_udlo", String(MIN_PRICE_USD));
  if (sold) {
    search.searchParams.set("LH_Sold", "1");
    search.searchParams.set("LH_Complete", "1");
  }

  const response = await gotScraping({
    url: search.toString(),
    proxyUrl: proxyConfiguration ? await proxyConfiguration.newUrl() : undefined,
    headers: {
      "User-Agent": USER_AGENT,
      "Accept-Language": "en-US,en;q=0.9",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
    }
  });

  if (response.statusCode < 200 || response.statusCode >= 300) {
    throw new Error(`eBay returned ${response.statusCode} for ${model}`);
  }

  return { url: search.toString(), html: response.body };
}

async function fetchEbaySearchPages(model, { sold, proxyConfiguration }) {
  const pages = [];
  for (const keyword of ebayKeywords(model)) {
    pages.push(await fetchEbaySearchPageByKeyword(model, keyword, { sold, proxyConfiguration }));
    await sleep(300);
  }
  return pages;
}

async function fetchEbaySearchPageByKeyword(model, keyword, { sold, proxyConfiguration }) {
  const search = new URL("https://www.ebay.com/sch/i.html");
  search.searchParams.set("_nkw", keyword);
  search.searchParams.set("_sacat", DIGITAL_CAMERAS_CATEGORY_ID);
  search.searchParams.set("_ipg", "100");
  search.searchParams.set("rt", "nc");
  search.searchParams.set("LH_PrefLoc", "2");
  search.searchParams.set("_udlo", String(MIN_PRICE_USD));
  if (sold) {
    search.searchParams.set("LH_Sold", "1");
    search.searchParams.set("LH_Complete", "1");
  }

  const response = await gotScraping({
    url: search.toString(),
    proxyUrl: proxyConfiguration ? await proxyConfiguration.newUrl() : undefined,
    headers: {
      "User-Agent": USER_AGENT,
      "Accept-Language": "en-US,en;q=0.9",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
    }
  });

  if (response.statusCode < 200 || response.statusCode >= 300) {
    throw new Error(`eBay returned ${response.statusCode} for ${model} / ${keyword}`);
  }

  return { keyword, url: search.toString(), html: response.body };
}

function ebayKeywords(model) {
  return [
    `SONY Cyber-shot ${model}`,
    `SONY ${model}`,
    `Cyber-shot ${model}`
  ];
}

function parseSoldItems(html, model) {
  const $ = cheerio.load(html);
  const items = [];

  $(".s-item").each((_, element) => {
    const node = $(element);
    const title = cleanText(node.find(".s-item__title").first().text());
    const priceUsd = parseUsd(node.find(".s-item__price").first().text());
    const shippingUsd = parseShipping(node.find(".s-item__shipping, .s-item__logisticsCost").first().text());
    const itemUrl = node.find("a.s-item__link").first().attr("href")?.split("?")[0] || null;
    const soldAt = parseSoldAt(node.text());

    if (!titleMatchesModel(title, model)) return;
    if (!isValidCameraTitle(title)) return;
    if (!Number.isFinite(priceUsd) || priceUsd <= 0) return;

    items.push({
      title,
      priceUsd,
      shippingUsd,
      itemUrl,
      soldAt
    });
  });

  return dedupeByUrl(items);
}

function isValidCameraTitle(title) {
  const normalized = normalizeTitle(title);
  if (!normalized || normalized.includes("shop on ebay")) return false;
  if (!normalized.includes("sony")) return false;
  if (!normalized.includes("cyber shot") && !normalized.includes("cybershot")) return false;
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

function parseResultCount(html) {
  const $ = cheerio.load(html);
  const heading = cleanText($(".srp-controls__count-heading").first().text() || $("h1").first().text());
  const match = heading.match(/([\d,]+)\s*(?:results?|items?)/i) || heading.match(/^([\d,]+)/);
  return match ? Number(match[1].replace(/,/g, "")) : 0;
}

function parseUsd(text) {
  const normalized = cleanText(text).replace(/,/g, "");
  const match = normalized.match(/\$?\s*(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : NaN;
}

function parseShipping(text) {
  const normalized = cleanText(text).toLowerCase();
  if (!normalized || normalized.includes("free")) return 0;
  return parseUsd(normalized);
}

function parseSoldAt(text) {
  const cleaned = cleanText(text);
  const match = cleaned.match(/Sold\s+([A-Z][a-z]{2}\s+\d{1,2},\s+\d{4})/);
  if (!match) return null;
  const date = new Date(`${match[1]} 12:00:00 UTC`);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
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
    price_usd: item.priceUsd,
    shipping_usd: item.shippingUsd,
    item_url: item.itemUrl,
    source: "apify_ebay_sold",
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
