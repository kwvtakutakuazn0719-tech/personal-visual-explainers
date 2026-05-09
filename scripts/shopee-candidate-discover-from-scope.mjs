/**
 * J（第1段）: `scope` を読み、`source_url` がまだ `ledger` に無い行だけを追記する。
 * - Amazon.co.jp の `/dp/ASIN` または `/gp/product/ASIN` なら `current_asin` を埋める。
 * - **Jina Reader**（`https://r.jina.ai/{url}`）で非 Amazon 商品 URL の本文を取得し、
 *   `amazon_keywords` が空なら **タイトル＋ブランド**から PA-API 用クエリを推測する（任意 `JINA_API_KEY`）。
 * - 列 `amazon_keywords` があればそれを優先し、**PA-API SearchItems** で先頭ヒットの ASIN を採用
 *   （要: AMAZON_PA_API_* と AMAZON_ASSOCIATES_PARTNER_TAG）。誤突合防止のため `asin_review=pending`。
 *
 * 環境変数: SPREADSHEET_ID, GOOGLE_SERVICE_ACCOUNT_JSON
 * 任意: AMAZON_PA_API_*, AMAZON_ASSOCIATES_PARTNER_TAG, JINA_API_KEY
 * 任意: JINA_READER_DISABLED=1（Reader を使わない）, JINA_READER_MAX_PER_RUN（既定 10）
 */

import { google } from "googleapis";
import { isPaapiConfigured, searchItemsFirstHit } from "./lib/amazon-paapi-jp.mjs";
import { formatJstYmd } from "./lib/jst-date.mjs";
import {
  fetchReaderMarkdown,
  guessAmazonKeywordsFromReader,
  parseReaderResponse,
} from "./lib/jina-reader.mjs";

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

function jinaReaderDisabled() {
  const v = String(process.env.JINA_READER_DISABLED ?? "").trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

function jinaMaxPerRun() {
  const n = Number.parseInt(String(process.env.JINA_READER_MAX_PER_RUN ?? "10"), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, 40) : 10;
}

function excerptForNote(text, max = 700) {
  const t = String(text ?? "").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

/** Google シートのセル上限に近づかないよう切る */
function capCell(s, max = 47000) {
  const t = String(s ?? "");
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`;
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
  let jinaCalls = 0;
  const jinaCap = jinaMaxPerRun();
  const jinaDelayMs = 1800;

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

    let readerParsed = null;
    let readerExcerpt = "";
    const useJina =
      !jinaReaderDisabled() &&
      jinaCalls < jinaCap &&
      /^https?:\/\//i.test(source_url) &&
      !asin;

    if (useJina) {
      try {
        const raw = await fetchReaderMarkdown(source_url);
        jinaCalls += 1;
        readerParsed = parseReaderResponse(raw);
        readerExcerpt = excerptForNote(readerParsed.body || raw, 720);
        if (jinaCalls < jinaCap) {
          await new Promise((res) => setTimeout(res, jinaDelayMs));
        }
      } catch (e) {
        console.error("Jina Reader failed:", source_url, e?.message || e);
        amazon_match_note = `Jina Reader 失敗: ${String(e?.message || e).slice(0, 180)}`;
      }
    }

    const guessedKw =
      readerParsed && !amazon_keywords
        ? guessAmazonKeywordsFromReader(brand, readerParsed)
        : "";
    const effectiveKeywords = (amazon_keywords || guessedKw).trim();

    if (readerParsed?.title && !asin) {
      candidate_name = readerParsed.title.slice(0, 200);
      signal_type = source_type ? `${source_type}+jina` : "scope_url+jina";
    }

    if (asin) {
      candidate_name = `Amazon.jp (${asin})`;
      signal_type = "amazon_listing";
    } else if (effectiveKeywords && isPaapiConfigured()) {
      try {
        const hit = await searchItemsFirstHit(effectiveKeywords);
        if (hit) {
          asin = hit.asin;
          candidate_name = (hit.title || "").slice(0, 200) || `Amazon.jp (${asin})`;
          signal_type = amazon_keywords ? "amazon_paapi_search" : "amazon_paapi_search+jina_kw";
          amazon_match_note = [
            guessedKw && !amazon_keywords
              ? `PA-API SearchItems 先頭ヒット（クエリ推測: Jina + brand）`
              : "PA-API SearchItems 先頭ヒット（asin_review は人間確認前提）",
            readerExcerpt && `[Jina 抜粋] ${readerExcerpt}`,
            amazon_match_note,
          ]
            .filter(Boolean)
            .join("\n");
        } else {
          if (!candidate_name) {
            candidate_name = `From scope (${source_type || "link"})`;
          }
          if (!signal_type || !String(signal_type).includes("jina")) {
            signal_type = source_type || "scope_url";
          }
          amazon_match_note = [
            "PA-API 検索結果なし（amazon_keywords / Jina 推測クエリを絞り込むか直リンクを検討）",
            readerExcerpt && `[Jina 抜粋] ${readerExcerpt}`,
            amazon_match_note,
          ]
            .filter(Boolean)
            .join("\n");
        }
      } catch (e) {
        console.error("PA-API searchItems failed:", e?.message || e);
        if (!candidate_name) {
          candidate_name = `From scope (${source_type || "link"})`;
        }
        if (!signal_type || !String(signal_type).includes("jina")) {
          signal_type = source_type || "scope_url";
        }
        amazon_match_note = [
          `PA-API エラー: ${String(e?.message || e).slice(0, 200)}`,
          readerExcerpt && `[Jina 抜粋] ${readerExcerpt}`,
          amazon_match_note,
        ]
          .filter(Boolean)
          .join("\n");
      }
    } else if ((amazon_keywords || guessedKw) && !isPaapiConfigured()) {
      if (!candidate_name) {
        candidate_name = `From scope (${source_type || "link"})`;
      }
      if (!signal_type || !String(signal_type).includes("jina")) {
        signal_type = source_type || "scope_url";
      }
      const hint = amazon_keywords
        ? "amazon_keywords あり。GitHub Secrets に AMAZON_PA_API_* と AMAZON_ASSOCIATES_PARTNER_TAG を設定すると自動突合"
        : `Jina から検索語候補を推測（${guessedKw.slice(0, 100)}）— PA-API の Secrets を入れると自動突合`;
      amazon_match_note = [
        hint,
        readerExcerpt && `[Jina 抜粋] ${readerExcerpt}`,
        amazon_match_note,
      ]
        .filter(Boolean)
        .join("\n");
    } else {
      if (!candidate_name) {
        candidate_name = `From scope (${source_type || "link"})`;
      }
      if (!signal_type) signal_type = source_type || "scope_url";
      if (readerExcerpt && !amazon_match_note) {
        amazon_match_note = `[Jina 抜粋] ${readerExcerpt}`;
      } else if (readerExcerpt) {
        amazon_match_note = [amazon_match_note, `[Jina 抜粋] ${readerExcerpt}`]
          .filter(Boolean)
          .join("\n");
      }
      if (!effectiveKeywords && readerParsed && !isPaapiConfigured()) {
        amazon_match_note = [
          amazon_match_note,
          "PA-API 未設定のため ASIN 自動突合なし（キーを入れると Jina 推測クエリで検索）",
        ]
          .filter(Boolean)
          .join("\n");
      } else if (effectiveKeywords && !readerParsed && !isPaapiConfigured()) {
        amazon_match_note = [
          amazon_match_note,
          "PA-API 未設定（Jina 未取得のため検索語推測なし）",
        ]
          .filter(Boolean)
          .join("\n");
      }
    }

    const confidence_note = [
      "auto: scope import",
      readerParsed ? "jina=1" : useJina ? "jina=fail" : "",
      priority && `priority=${priority}`,
      notes && `notes=${notes}`,
      amazon_keywords && `keywords=${amazon_keywords}`,
      guessedKw && !amazon_keywords && `guessed_kw=${guessedKw.slice(0, 120)}`,
    ]
      .filter(Boolean)
      .join(" | ");

    newRows.push([
      newCandidateId(),
      category,
      brand,
      capCell(candidate_name, 500),
      source_url,
      signal_type,
      capCell(confidence_note, 2000),
      nowIso,
      "new",
      asin,
      asin ? "pending" : "",
      "", // asin_reject_reason
      "", // first_reject_at
      "", // next_asin_reseek_at
      "", // asin_reseek_deadline
      "", // asin_reseek_attempts
      capCell(amazon_match_note, 48000),
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
