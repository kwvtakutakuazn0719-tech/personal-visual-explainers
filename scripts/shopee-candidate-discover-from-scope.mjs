/**
 * J（第1段）: `scope` を読み、`source_url` がまだ `ledger` に無い行だけを追記する。
 * - Amazon.co.jp の `/dp/ASIN` または `/gp/product/ASIN` なら `current_asin` を埋める。
 * - 列 `amazon_keywords` に検索語がある場合、**PA-API SearchItems** で先頭ヒットの ASIN を採用
 *   （要: AMAZON_PA_API_* と AMAZON_ASSOCIATES_PARTNER_TAG）。誤突合防止のため `asin_review=pending`。
 *
 * 環境変数: SPREADSHEET_ID, GOOGLE_SERVICE_ACCOUNT_JSON
 * 任意: AMAZON_PA_API_ACCESS_KEY, AMAZON_PA_API_SECRET_KEY, AMAZON_ASSOCIATES_PARTNER_TAG
 */

import { google } from "googleapis";
import { isPaapiConfigured, searchItemsFirstHit } from "./lib/amazon-paapi-jp.mjs";
import { formatJstYmd } from "./lib/jst-date.mjs";

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const rawJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

/** @returns {string} */
function extractAmazonJpAsin(urlStr) {
  const s = (urlStr || "").trim();
  if (!s) return "";
  try {
    const u = new URL(s);
    const host = u.hostname.replace(/^www\./i, "").toLowerCase();
    if (host !== "amazon.co.jp") return "";
    const m = u.pathname.match(/(?:\/dp\/|\/gp\/product\/)([A-Z0-9]{10})(?:\/|$)/i);
    return m ? m[1].toUpperCase() : "";
  } catch {
    return "";
  }
}

function newCandidateId() {
  return `C-${Date.now().toString(36)}-${globalThis.crypto.randomUUID().slice(0, 8)}`;
}

async function getSheetsClient() {
  if (!SPREADSHEET_ID || !rawJson) {
    console.error("Missing SPREADSHEET_ID or GOOGLE_SERVICE_ACCOUNT_JSON");
    process.exit(1);
  }
  const credentials = JSON.parse(rawJson);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const authClient = await auth.getClient();
  return google.sheets({ version: "v4", auth: authClient });
}

async function main() {
  const sheets = await getSheetsClient();

  const scopeRes = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: "scope!A1:G500",
  });
  const scopeRows = scopeRes.data.values ?? [];
  if (scopeRows.length < 2) {
    console.log("scope: no data rows (header only or empty). Nothing to do.");
    return;
  }

  const header = scopeRows[0].map((c) => String(c ?? "").trim().toLowerCase());
  const col = (name) => {
    const i = header.indexOf(name.toLowerCase());
    return i >= 0 ? i : -1;
  };
  const ix = {
    category: col("category"),
    brand: col("brand"),
    source_type: col("source_type"),
    source_url: col("source_url"),
    priority: col("priority"),
    notes: col("notes"),
    amazon_keywords: col("amazon_keywords"),
  };
  if (ix.source_url < 0) {
    console.error('scope sheet: missing "source_url" column in header');
    process.exit(1);
  }

  const ledgerRes = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: "ledger!A1:V2000",
  });
  const ledgerRows = ledgerRes.data.values ?? [];
  const existingUrls = new Set();
  const SOURCE_URL_COL = 4;
  for (let r = 1; r < ledgerRows.length; r++) {
    const row = ledgerRows[r];
    const u = row?.[SOURCE_URL_COL];
    if (u) existingUrls.add(String(u).trim());
  }

  const nowIso = formatJstYmd();
  const newRows = [];

  for (let r = 1; r < scopeRows.length; r++) {
    const row = scopeRows[r] ?? [];
    const get = (i) => (i >= 0 ? String(row[i] ?? "").trim() : "");
    const source_url = get(ix.source_url);
    if (!source_url) continue;
    if (existingUrls.has(source_url)) continue;

    const category = get(ix.category);
    const brand = get(ix.brand);
    const source_type = get(ix.source_type);
    const priority = get(ix.priority);
    const notes = get(ix.notes);
    const amazon_keywords = get(ix.amazon_keywords);

    let asin = extractAmazonJpAsin(source_url);
    let amazon_match_note = "";
    let candidate_name = "";
    let signal_type = "";

    if (asin) {
      candidate_name = `Amazon.jp (${asin})`;
      signal_type = "amazon_listing";
    } else if (amazon_keywords && isPaapiConfigured()) {
      try {
        const hit = await searchItemsFirstHit(amazon_keywords);
        if (hit) {
          asin = hit.asin;
          candidate_name = (hit.title || "").slice(0, 200) || `Amazon.jp (${asin})`;
          signal_type = "amazon_paapi_search";
          amazon_match_note =
            "PA-API SearchItems 先頭ヒット（asin_review は人間確認前提）";
        } else {
          candidate_name = `From scope (${source_type || "link"})`;
          signal_type = source_type || "scope_url";
          amazon_match_note =
            "PA-API 検索結果なし（amazon_keywords を絞り込むか直リンクを検討）";
        }
      } catch (e) {
        console.error("PA-API searchItems failed:", e?.message || e);
        candidate_name = `From scope (${source_type || "link"})`;
        signal_type = source_type || "scope_url";
        amazon_match_note = `PA-API エラー: ${String(e?.message || e).slice(0, 200)}`;
      }
    } else if (amazon_keywords && !isPaapiConfigured()) {
      candidate_name = `From scope (${source_type || "link"})`;
      signal_type = source_type || "scope_url";
      amazon_match_note =
        "amazon_keywords あり。GitHub Secrets に AMAZON_PA_API_* と AMAZON_ASSOCIATES_PARTNER_TAG を設定すると自動突合";
    } else {
      candidate_name = `From scope (${source_type || "link"})`;
      signal_type = source_type || "scope_url";
    }

    const confidence_note = [
      "auto: scope import",
      priority && `priority=${priority}`,
      notes && `notes=${notes}`,
      amazon_keywords && !asin && `keywords=${amazon_keywords}`,
    ]
      .filter(Boolean)
      .join(" | ");

    newRows.push([
      newCandidateId(),
      category,
      brand,
      candidate_name,
      source_url,
      signal_type,
      confidence_note,
      nowIso,
      "new",
      asin,
      asin ? "pending" : "",
      "", // asin_reject_reason
      "", // first_reject_at
      "", // next_asin_reseek_at
      "", // asin_reseek_deadline
      "", // asin_reseek_attempts
      amazon_match_note,
      "", // model_code
      "", // variant_note
      nowIso,
      "github-actions",
      "", // cancel_reason
    ]);
    existingUrls.add(source_url);
  }

  if (newRows.length === 0) {
    console.log("ledger: no new rows to append (all scope URLs already present).");
    return;
  }

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: "ledger!A1",
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: newRows },
  });

  console.log(`ledger: appended ${newRows.length} row(s) from scope.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
