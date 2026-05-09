/**
 * Amazon Product Advertising API 5.0（日本向け host/region）。
 * 廃止予定: 2026-05-15 以降は Creators API への移行を検討（公式ドキュメント参照）。
 *
 * 環境変数:
 *   AMAZON_PA_API_ACCESS_KEY   PA-API 用アクセスキー
 *   AMAZON_PA_API_SECRET_KEY   シークレットキー
 *   AMAZON_ASSOCIATES_PARTNER_TAG  アソシエイトのストアID（例: mysite-22）
 */

import { createRequire } from "module";

const require = createRequire(import.meta.url);
/** @type {Record<string, unknown>} */
const PA = require("paapi5-nodejs-sdk");

const HOST = "webservices.amazon.co.jp";
const REGION = "us-west-2";
const MARKETPLACE = "www.amazon.co.jp";

const CARD_RESOURCES = [
  "Images.Primary.Large",
  "ItemInfo.Title",
  "DetailPageURL",
];

export function isPaapiConfigured() {
  return Boolean(
    process.env.AMAZON_PA_API_ACCESS_KEY &&
      process.env.AMAZON_PA_API_SECRET_KEY &&
      process.env.AMAZON_ASSOCIATES_PARTNER_TAG,
  );
}

function applyCredentials() {
  const client = PA.ApiClient.instance;
  client.accessKey = process.env.AMAZON_PA_API_ACCESS_KEY;
  client.secretKey = process.env.AMAZON_PA_API_SECRET_KEY;
  client.host = HOST;
  client.region = REGION;
}

/**
 * @param {unknown} api
 * @param {string} method
 * @param {unknown} request
 */
function callPaapi(api, method, request) {
  return new Promise((resolve, reject) => {
    api[method](request, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}

/**
 * @param {string} keywords
 * @returns {Promise<{ asin: string; title: string } | null>}
 */
export async function searchItemsFirstHit(keywords) {
  if (!isPaapiConfigured()) return null;
  const q = String(keywords ?? "").trim();
  if (!q) return null;

  applyCredentials();
  const api = new PA.DefaultApi();
  const req = new PA.SearchItemsRequest();
  req["PartnerTag"] = process.env.AMAZON_ASSOCIATES_PARTNER_TAG;
  req["PartnerType"] = "Associates";
  req["Keywords"] = q;
  req["Marketplace"] = MARKETPLACE;
  req["ItemCount"] = 5;
  req["Resources"] = ["Images.Primary.Medium", "ItemInfo.Title"];

  const data = await callPaapi(api, "searchItems", req);
  const items = data?.SearchResult?.Items;
  if (!Array.isArray(items) || items.length === 0) return null;
  const first = items[0];
  const asin = first?.ASIN ? String(first.ASIN) : "";
  const title =
    first?.ItemInfo?.Title?.DisplayValue != null
      ? String(first.ItemInfo.Title.DisplayValue)
      : "";
  if (!asin) return null;
  return { asin, title };
}

/**
 * @param {string[]} asins
 * @returns {Promise<Map<string, { title: string; imageUrl: string; detailUrl: string }>>}
 */
export async function getItemsCardFields(asins) {
  const out = new Map();
  if (!isPaapiConfigured() || asins.length === 0) return out;

  applyCredentials();
  const api = new PA.DefaultApi();
  const uniq = [...new Set(asins.map((a) => String(a || "").trim()).filter(Boolean))];

  for (let i = 0; i < uniq.length; i += 10) {
    const chunk = uniq.slice(i, i + 10);
    const req = new PA.GetItemsRequest();
    req["PartnerTag"] = process.env.AMAZON_ASSOCIATES_PARTNER_TAG;
    req["PartnerType"] = "Associates";
    req["ItemIds"] = chunk;
    req["Marketplace"] = MARKETPLACE;
    req["Resources"] = CARD_RESOURCES;

    let data;
    try {
      data = await callPaapi(api, "getItems", req);
    } catch {
      continue;
    }
    const items = data?.ItemsResult?.Items;
    if (!Array.isArray(items)) continue;
    for (const item of items) {
      const asin = item?.ASIN ? String(item.ASIN) : "";
      if (!asin) continue;
      const title =
        item?.ItemInfo?.Title?.DisplayValue != null
          ? String(item.ItemInfo.Title.DisplayValue)
          : "";
      const imageUrl =
        item?.Images?.Primary?.Large?.URL != null
          ? String(item.Images.Primary.Large.URL)
          : item?.Images?.Primary?.Medium?.URL != null
            ? String(item.Images.Primary.Medium.URL)
            : "";
      const detailUrl =
        item?.DetailPageURL != null ? String(item.DetailPageURL) : `https://www.amazon.co.jp/dp/${asin}`;
      out.set(asin, { title, imageUrl, detailUrl });
    }
  }
  return out;
}
