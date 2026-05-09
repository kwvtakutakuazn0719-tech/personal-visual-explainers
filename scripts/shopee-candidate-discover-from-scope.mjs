/**
 * J（第1段）: `scope` シートを読み、`source_url` がまだ `ledger` に無い行だけを追記する。
 * - Amazon.co.jp の `/dp/ASIN` または `/gp/product/ASIN` 形式なら `current_asin` を埋める。
 * - 公式・ブログ等の URL は ASIN なしで1行追加（人間があとで突合・メモする入口）。
 *
 * 環境変数: SPREADSHEET_ID, GOOGLE_SERVICE_ACCOUNT_JSON（bootstrap と同じ）
 */

import { google } from "googleapis";

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
    range: "scope!A1:F500",
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
  };
  if (ix.source_url < 0) {
    console.error('scope sheet: missing "source_url" column in header');
    process.exit(1);
  }

  const ledgerRes = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: "ledger!A1:W2000",
  });
  const ledgerRows = ledgerRes.data.values ?? [];
  const existingUrls = new Set();
  const SOURCE_URL_COL = 4;
  for (let r = 1; r < ledgerRows.length; r++) {
    const row = ledgerRows[r];
    const u = row?.[SOURCE_URL_COL];
    if (u) existingUrls.add(String(u).trim());
  }

  const nowIso = new Date().toISOString().slice(0, 10);
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
    const asin = extractAmazonJpAsin(source_url);

    const candidate_name = asin
      ? `Amazon.jp (${asin})`
      : `From scope (${source_type || "link"})`;
    const signal_type = asin ? "amazon_listing" : source_type || "scope_url";
    const confidence_note = [
      "auto: scope import",
      priority && `priority=${priority}`,
      notes && `notes=${notes}`,
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
      "", // amazon_match_note
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
