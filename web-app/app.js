let marketData = [
  { series: "T", model: "T1", avgUsd: 148.22, lowUsd: 90, highUsd: 510, avgShippingUsd: 24.2, sellThrough: 0.3276, listings: 160, reliability: "High" },
  { series: "T", model: "T2", avgUsd: 115.31, lowUsd: 89.09, highUsd: 133, avgShippingUsd: 17.72, sellThrough: 0.1058, listings: 27, reliability: "Medium" },
  { series: "T", model: "T11", avgUsd: 112.15, lowUsd: 85, highUsd: 139.3, avgShippingUsd: 12, sellThrough: 0, listings: 2, reliability: "Low" },
  { series: "T", model: "T5", avgUsd: 101.83, lowUsd: 80, highUsd: 192, avgShippingUsd: 9.8, sellThrough: 0, listings: 19, reliability: "Low" },
  { series: "T", model: "T7", avgUsd: 112.4, lowUsd: 80, highUsd: 225.5, avgShippingUsd: 10.76, sellThrough: 0.1759, listings: 34, reliability: "Medium" },
  { series: "T", model: "T33", avgUsd: 80, lowUsd: 80, highUsd: 80, avgShippingUsd: 11.8, sellThrough: 0.0078, listings: 1, reliability: "Low" },
  { series: "T", model: "T9", avgUsd: 106.54, lowUsd: 80, highUsd: 199.99, avgShippingUsd: 11.37, sellThrough: 0.0337, listings: 13, reliability: "Low" },
  { series: "T", model: "T10", avgUsd: 120.69, lowUsd: 81, highUsd: 163, avgShippingUsd: 12.35, sellThrough: 0.0913, listings: 55, reliability: "Medium" },
  { series: "T", model: "T30", avgUsd: 100.27, lowUsd: 85, highUsd: 121, avgShippingUsd: 14.19, sellThrough: 0.0474, listings: 10, reliability: "Low" },
  { series: "T", model: "T50", avgUsd: 130.99, lowUsd: 80, highUsd: 400, avgShippingUsd: 10.61, sellThrough: 0.0511, listings: 9, reliability: "Low" },
  { series: "T", model: "T20", avgUsd: 118.65, lowUsd: 80, highUsd: 178.5, avgShippingUsd: 12.45, sellThrough: 0.0575, listings: 25, reliability: "Medium" },
  { series: "T", model: "T70", avgUsd: 128.83, lowUsd: 80, highUsd: 349.4, avgShippingUsd: 16.27, sellThrough: 0.1142, listings: 64, reliability: "Medium" },
  { series: "T", model: "T100", avgUsd: 109.78, lowUsd: 81, highUsd: 155, avgShippingUsd: 11.13, sellThrough: 0.194, listings: 58, reliability: "High" },
  { series: "T", model: "T200", avgUsd: 127.09, lowUsd: 85, highUsd: 198.79, avgShippingUsd: 12.99, sellThrough: 0.163, listings: 50, reliability: "High" },
  { series: "T", model: "T77", avgUsd: 131.34, lowUsd: 80, highUsd: 199, avgShippingUsd: 26.29, sellThrough: 0.1752, listings: 102, reliability: "High" },
  { series: "T", model: "T300", avgUsd: 110.62, lowUsd: 80, highUsd: 199, avgShippingUsd: 10.33, sellThrough: 0.087, listings: 20, reliability: "Medium" },
  { series: "T", model: "T500", avgUsd: 136.96, lowUsd: 99.95, highUsd: 168.99, avgShippingUsd: 12.5, sellThrough: 0.0833, listings: 4, reliability: "Low" },
  { series: "T", model: "T700", avgUsd: 148.22, lowUsd: 90, highUsd: 510, avgShippingUsd: 24.2, sellThrough: 0.3276, listings: 160, reliability: "High" },
  { series: "T", model: "T90", avgUsd: 124.78, lowUsd: 80, highUsd: 199, avgShippingUsd: 13.69, sellThrough: 0.1855, listings: 80, reliability: "High" },
  { series: "T", model: "T900", avgUsd: 129.58, lowUsd: 85, highUsd: 399, avgShippingUsd: 17.74, sellThrough: 0.1618, listings: 46, reliability: "Medium" },
  { series: "TX", model: "TX1", avgUsd: 121.59, lowUsd: 80, highUsd: 203, avgShippingUsd: 16.14, sellThrough: 0.2186, listings: 85, reliability: "High" },
  { series: "TX", model: "TX5", avgUsd: 122.93, lowUsd: 83.3, highUsd: 165, avgShippingUsd: 15.27, sellThrough: 0.0735, listings: 19, reliability: "Low" },
  { series: "TX", model: "TX7", avgUsd: 120.9, lowUsd: 89, highUsd: 172.5, avgShippingUsd: 11.13, sellThrough: 0.1816, listings: 51, reliability: "High" },
  { series: "TX", model: "TX9", avgUsd: 132.47, lowUsd: 88, highUsd: 199.99, avgShippingUsd: 10.78, sellThrough: 0.1514, listings: 28, reliability: "Medium" },
  { series: "TX", model: "TX10", avgUsd: 131.25, lowUsd: 85, highUsd: 176.6, avgShippingUsd: 16.96, sellThrough: 0.1619, listings: 72, reliability: "High" },
  { series: "TX", model: "TX55", avgUsd: 141.6, lowUsd: 80, highUsd: 181.58, avgShippingUsd: 10.46, sellThrough: 0.185, listings: 29, reliability: "Medium" },
  { series: "TX", model: "TX100V", avgUsd: 133.84, lowUsd: 107.99, highUsd: 180, avgShippingUsd: 34.85, sellThrough: 0.1556, listings: 7, reliability: "Low" },
  { series: "TX", model: "TX20", avgUsd: 140.05, lowUsd: 80.99, highUsd: 186.33, avgShippingUsd: 14.22, sellThrough: 0.2745, listings: 36, reliability: "Medium" },
  { series: "TX", model: "TX66", avgUsd: 159.73, lowUsd: 99.99, highUsd: 450, avgShippingUsd: 17.35, sellThrough: 0.192, listings: 29, reliability: "Medium" },
  { series: "TX", model: "TX200V", avgUsd: 148.74, lowUsd: 119.99, highUsd: 175, avgShippingUsd: 9.62, sellThrough: 0.8, listings: 4, reliability: "Low" },
  { series: "TX", model: "TX30", avgUsd: 169.46, lowUsd: 99, highUsd: 405, avgShippingUsd: 15.55, sellThrough: 0.3789, listings: 55, reliability: "High" },
  { series: "TX", model: "TX300V", avgUsd: 146.57, lowUsd: 109.99, highUsd: 183.15, avgShippingUsd: 42, sellThrough: 0.0556, listings: 2, reliability: "Low" }
];

const destinations = [
  { label: "アメリカ本土48州", costJpy: 2188 },
  { label: "アメリカ本土48州以外", costJpy: 2718 },
  { label: "イギリス", costJpy: 1482 },
  { label: "ドイツ", costJpy: 2296 },
  { label: "オーストラリア", costJpy: 1537 }
];

const settings = {
  usdJpy: 150,
  feeRate: 0.15,
  fixedFeeJpy: 0,
  packingJpy: 84.43,
  domesticShippingJpy: 0,
  shippingIncomeUsd: 0,
  targetProfitJpy: 5000,
  targetMargin: 0.25,
  cautionProfitJpy: 2500,
  factors: [
    { key: "rotation", label: "回転重視", factor: 0.9 },
    { key: "middle", label: "中間", factor: 1 },
    { key: "margin", label: "粗利重視", factor: 1.15 }
  ]
};

const els = {
  modelSelect: document.querySelector("#modelSelect"),
  destinationSelect: document.querySelector("#destinationSelect"),
  purchasePrice: document.querySelector("#purchasePrice"),
  purchaseShipping: document.querySelector("#purchaseShipping"),
  extraCost: document.querySelector("#extraCost"),
  usdJpy: document.querySelector("#usdJpy"),
  manualItemUsdInput: document.querySelector("#manualItemUsdInput"),
  filterInput: document.querySelector("#filterInput"),
  scenarioCards: document.querySelector("#scenarioCards"),
  soldRankingTable: document.querySelector("#soldRankingTable")
};

function hasSupabaseConfig() {
  return Boolean(window.APP_CONFIG?.supabaseUrl && window.APP_CONFIG?.supabaseAnonKey);
}

function mapSupabaseRow(row) {
  return {
    series: row.series,
    model: row.model,
    avgUsd: Number(row.avg_usd || 0),
    lowUsd: Number(row.low_usd || 0),
    highUsd: Number(row.high_usd || 0),
    avgShippingUsd: Number(row.avg_shipping_usd || 0),
    avgFreeShippingTotalUsd: Number(row.avg_free_shipping_total_usd || 0),
    freeShippingCount: Number(row.free_shipping_count || 0),
    avgPaidShippingTotalUsd: Number(row.avg_paid_shipping_total_usd || 0),
    paidShippingCount: Number(row.paid_shipping_count || 0),
    listings: Number(row.listings || 0),
    reliability: row.reliability || "Unknown",
    updatedAt: row.updated_at
  };
}

function modelNumberSort(a, b) {
  return a.model.localeCompare(b.model, "en", { numeric: true });
}

function soldRankingSort(a, b) {
  if (b.listings !== a.listings) return b.listings - a.listings;
  if (b.avgUsd !== a.avgUsd) return b.avgUsd - a.avgUsd;
  return modelNumberSort(a, b);
}

function soldRankingRows() {
  return [...marketData].sort(soldRankingSort);
}

function formatDateJst(value) {
  const date = value ? new Date(value) : new Date();
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date).replaceAll("/", "-");
}

async function fetchSupabaseMarketData() {
  if (!hasSupabaseConfig()) return null;
  const base = window.APP_CONFIG.supabaseUrl.replace(/\/$/, "");
  const url = `${base}/rest/v1/model_market_metrics?select=*`;
  const response = await fetch(url, {
    headers: {
      apikey: window.APP_CONFIG.supabaseAnonKey,
      Authorization: `Bearer ${window.APP_CONFIG.supabaseAnonKey}`
    }
  });
  if (!response.ok) throw new Error(`Supabase read failed: ${response.status}`);
  const rows = await response.json();
  return rows.map(mapSupabaseRow).sort(soldRankingSort);
}

function yen(value) {
  return new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY", maximumFractionDigits: 0 }).format(value || 0);
}

function usd(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function usdOrDash(value, count) {
  if (!count || !Number(value)) return "-";
  return usd(value);
}

function pct(value) {
  return `${((value || 0) * 100).toFixed(1)}%`;
}

function numeric(id) {
  return Number(els[id].value || 0);
}

function syncSettingsFromInputs() {
  settings.usdJpy = numeric("usdJpy") || 150;
}

function currentModel() {
  return marketData.find((item) => item.model === els.modelSelect.value) || marketData[0];
}

function currentDestination() {
  return destinations.find((item) => item.label === els.destinationSelect.value) || destinations[0];
}

function baseCosts() {
  return {
    purchase: numeric("purchasePrice"),
    purchaseShipping: numeric("purchaseShipping"),
    extra: numeric("extraCost"),
    cpass: currentDestination().costJpy,
    packing: settings.packingJpy,
    domestic: settings.domesticShippingJpy,
    fixed: settings.fixedFeeJpy
  };
}

function totalCost(costs) {
  return costs.purchase + costs.purchaseShipping + costs.extra + costs.cpass + costs.packing + costs.domestic + costs.fixed;
}

function calcScenario(model, scenario) {
  const totalSaleUsd = Number((model.avgUsd * scenario.factor).toFixed(2));
  const itemSaleUsd = totalSaleUsd;
  const revenueJpy = Math.round(totalSaleUsd * settings.usdJpy);
  const feeJpy = revenueJpy * settings.feeRate;
  const costs = baseCosts();
  const profitJpy = Math.round(revenueJpy - feeJpy - totalCost(costs));
  const margin = revenueJpy > 0 ? profitJpy / revenueJpy : 0;
  const maxBuyJpy = Math.max(0, Math.floor((revenueJpy * (1 - settings.feeRate) - settings.fixedFeeJpy - settings.packingJpy - settings.domesticShippingJpy - costs.cpass - costs.purchaseShipping - costs.extra - settings.targetProfitJpy) / 100) * 100);
  const status = profitJpy >= settings.targetProfitJpy && margin >= settings.targetMargin ? "BUY" : profitJpy >= settings.cautionProfitJpy ? "要検討" : "見送り";
  return { ...scenario, totalSaleUsd, itemSaleUsd, revenueJpy, profitJpy, margin, maxBuyJpy, status };
}

function breakEven() {
  const costs = baseCosts();
  const totalUsd = totalCost(costs) / (settings.usdJpy * (1 - settings.feeRate));
  return {
    totalUsd,
    itemUsd: totalUsd
  };
}

function calcManualSale() {
  const totalSaleUsd = numeric("manualItemUsdInput");
  const revenueJpy = Math.round(totalSaleUsd * settings.usdJpy);
  const feeJpy = revenueJpy * settings.feeRate;
  const profitJpy = Math.round(revenueJpy - feeJpy - totalCost(baseCosts()));
  const margin = revenueJpy > 0 ? profitJpy / revenueJpy : 0;
  return { totalSaleUsd, revenueJpy, profitJpy, margin };
}

function updateManualSale() {
  const result = calcManualSale();
  document.querySelector("#manualTotalUsd").textContent = usd(result.totalSaleUsd);
  document.querySelector("#manualRevenueJpy").textContent = yen(result.revenueJpy);
  document.querySelector("#manualProfitJpy").textContent = yen(result.profitJpy);
  document.querySelector("#manualMargin").textContent = pct(result.margin);
}

function updateSummary(model) {
  const be = breakEven();
  document.querySelector("#modelName").textContent = model.model;
  document.querySelector("#avgUsd").textContent = usd(model.avgUsd);
  document.querySelector("#avgFreeShippingUsd").textContent = usdOrDash(model.avgFreeShippingTotalUsd, model.freeShippingCount);
  document.querySelector("#avgFreeShippingCount").textContent = model.freeShippingCount ? `${model.freeShippingCount}件` : "";
  document.querySelector("#avgPaidShippingUsd").textContent = usdOrDash(model.avgPaidShippingTotalUsd, model.paidShippingCount);
  document.querySelector("#avgPaidShippingCount").textContent = model.paidShippingCount ? `${model.paidShippingCount}件` : "";
  document.querySelector("#rangeUsd").textContent = `${usd(model.lowUsd)} / ${usd(model.highUsd)}`;
  document.querySelector("#soldCount").textContent = `${model.listings}件`;
  document.querySelector("#reliability").textContent = model.reliability;
  document.querySelector("#cpassCost").textContent = yen(currentDestination().costJpy);
  document.querySelector("#breakEvenTotal").textContent = usd(be.totalUsd);
  document.querySelector("#breakEvenItem").textContent = usd(be.itemUsd);
}

function renderScenarios(model) {
  els.scenarioCards.innerHTML = settings.factors.map((factor) => {
    const result = calcScenario(model, factor);
    const statusClass = result.status === "BUY" ? "buy" : result.status === "要検討" ? "caution" : "skip";
    return `
      <article class="panel scenario">
        <h2>${result.label}<span>送料無料売価 ${usd(result.itemSaleUsd)}</span></h2>
        <div class="price">${yen(result.profitJpy)}</div>
        <div class="metrics">
          <div class="metric"><span>購入者支払額</span><strong>${usd(result.totalSaleUsd)}</strong></div>
          <div class="metric"><span>売上合計</span><strong>${yen(result.revenueJpy)}</strong></div>
          <div class="metric"><span>粗利率</span><strong>${pct(result.margin)}</strong></div>
          <div class="metric"><span>上限仕入れ価格</span><strong>${yen(result.maxBuyJpy)}</strong></div>
        </div>
        <div class="status ${statusClass}">${result.status}</div>
      </article>
    `;
  }).join("");
}

function renderSoldRanking() {
  const query = els.filterInput.value.trim().toUpperCase();
  els.soldRankingTable.innerHTML = soldRankingRows()
    .filter((item) => item.model.includes(query))
    .map((item, index) => {
      const scenarios = settings.factors.map((factor) => calcScenario(item, factor));
      return `
        <tr>
          <td>${index + 1}</td>
          <td>${item.model}</td>
          <td>${item.listings}件</td>
          <td>${usd(item.avgUsd)}</td>
          <td>${usdOrDash(item.avgFreeShippingTotalUsd, item.freeShippingCount)}</td>
          <td>${usdOrDash(item.avgPaidShippingTotalUsd, item.paidShippingCount)}</td>
          <td>${yen(scenarios[0].maxBuyJpy)}</td>
          <td>${yen(scenarios[1].maxBuyJpy)}</td>
          <td>${yen(scenarios[2].maxBuyJpy)}</td>
        </tr>
      `;
    }).join("");
}

function render() {
  syncSettingsFromInputs();
  const model = currentModel();
  updateSummary(model);
  renderScenarios(model);
  updateManualSale();
  renderSoldRanking();
}

async function init() {
  try {
    const remoteRows = await fetchSupabaseMarketData();
    if (remoteRows?.length) {
      marketData = remoteRows;
      const newest = remoteRows.map((row) => row.updatedAt).filter(Boolean).sort().at(-1);
      if (newest) {
        document.querySelector("#lastUpdated").textContent = formatDateJst(newest);
      }
    }
  } catch (error) {
    console.warn(error);
  }
  els.modelSelect.innerHTML = soldRankingRows().map((item) => `<option value="${item.model}">${item.model} / ${item.listings}件</option>`).join("");
  els.destinationSelect.innerHTML = destinations.map((item) => `<option value="${item.label}">${item.label}</option>`).join("");
  [els.modelSelect, els.destinationSelect, els.purchasePrice, els.purchaseShipping, els.extraCost, els.usdJpy, els.manualItemUsdInput, els.filterInput].forEach((el) => {
    el.addEventListener("input", render);
    el.addEventListener("change", render);
  });
  render();
}

init();
