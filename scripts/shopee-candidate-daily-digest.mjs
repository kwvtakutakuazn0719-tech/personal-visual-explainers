/**
 * 毎朝ジョブ用: 本日（JST）に `discovered_at` が付いた ledger 行を集約し、
 * - GitHub Actions の Job Summary（GITHUB_STEP_SUMMARY）
 * - 任意: Slack Incoming Webhook（SLACK_WEBHOOK_URL）
 * に「簡易プロダクトカード」風のレポートを書き出す。
 *
 * Amazon 商品メタ（タイトル・画像）は PA-API GetItems（鍵があるときのみ）。
 * 環境変数: SPREADSHEET_ID, GOOGLE_SERVICE_ACCOUNT_JSON
 * 任意: AMAZON_PA_API_*, AMAZON_ASSOCIATES_PARTNER_TAG, SLACK_WEBHOOK_URL
 */

import fs from "node:fs";
import { google } from "googleapis";
import { getItemsCardFields, isPaapiConfigured } from "./lib/amazon-paapi-jp.mjs";
import { formatJstYmd } from "./lib/jst-date.mjs";

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const rawJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

function ymdFromCell(s) {
  const t = String(s ?? "").trim();
  if (!t) return "";
  if (/^\d{4}-\d{2}-\d{2}/.test(t)) return t.slice(0, 10);
  return t;
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

function colIndex(header, name) {
  const i = header.indexOf(name.toLowerCase());
  return i >= 0 ? i : -1;
}

function appendSummary(line) {
  const path = process.env.GITHUB_STEP_SUMMARY;
  if (path) fs.appendFileSync(path, `${line}\n`, "utf8");
}

/**
 * @param {string} md
 */
async function postSlackMarkdown(md) {
  if (!SLACK_WEBHOOK_URL) return;
  const text = md.length > 2800 ? `${md.slice(0, 2790)}…(truncated)` : md;
  const body = {
    text: "Shopee 候補デイリーダイジェスト（JST）",
    blocks: [
      {
        type: "section",
        text: { type: "mrkdwn", text },
      },
    ],
  };
  const r = await fetch(SLACK_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    console.error("Slack webhook failed:", r.status, await r.text());
  }
}

async function main() {
  const sheets = await getSheetsClient();
  const todayJst = formatJstYmd();

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: "ledger!A1:V2000",
  });
  const rows = res.data.values ?? [];
  if (rows.length < 2) {
    console.log("ledger: no data rows.");
    appendSummary("### Shopee 候補ダイジェスト\n\nledger にデータ行がありません。");
    return;
  }

  const header = rows[0].map((c) => String(c ?? "").trim().toLowerCase());
  const ix = {
    candidate_id: colIndex(header, "candidate_id"),
    category: colIndex(header, "category"),
    brand: colIndex(header, "brand"),
    candidate_name: colIndex(header, "candidate_name"),
    source_url: colIndex(header, "source_url"),
    discovered_at: colIndex(header, "discovered_at"),
    status: colIndex(header, "status"),
    current_asin: colIndex(header, "current_asin"),
    asin_review: colIndex(header, "asin_review"),
    amazon_match_note: colIndex(header, "amazon_match_note"),
  };

  const pick = (row, i) => (i >= 0 ? String(row[i] ?? "").trim() : "");

  const todays = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r] ?? [];
    const discovered = ymdFromCell(pick(row, ix.discovered_at));
    if (discovered !== todayJst) continue;
    todays.push({
      candidate_id: pick(row, ix.candidate_id),
      category: pick(row, ix.category),
      brand: pick(row, ix.brand),
      candidate_name: pick(row, ix.candidate_name),
      source_url: pick(row, ix.source_url),
      status: pick(row, ix.status),
      current_asin: pick(row, ix.current_asin),
      asin_review: pick(row, ix.asin_review),
      amazon_match_note: pick(row, ix.amazon_match_note),
    });
  }

  let md = `### Shopee 出品候補 — 本日分（JST ${todayJst}）\n\n`;
  md += `- 本日付の行数: **${todays.length}**\n`;
  md += `- PA-API メタ取得: **${isPaapiConfigured() ? "有効" : "未設定（ASIN リンクと台帳列のみ）"}**\n\n`;

  if (todays.length === 0) {
    md += "_本日の `discovered_at` に該当する行はありません。_\n";
    console.log("digest: no rows for JST date", todayJst);
    appendSummary(md);
    await postSlackMarkdown(md);
    return;
  }

  const withAsin = todays.filter((x) => x.current_asin);
  const noAsin = todays.filter((x) => !x.current_asin);

  const asins = withAsin.map((x) => x.current_asin);
  const cardMap = await getItemsCardFields(asins);

  md += "#### カード（ASIN あり）\n\n";
  let slackMd = `*Shopee 出品候補ダイジェスト*（JST ${todayJst}）\n_ASIN あり ${withAsin.length}件 / なし ${noAsin.length}件_\n\n`;

  for (const row of withAsin) {
    const asin = row.current_asin;
    const card = cardMap.get(asin);
    const title = card?.title || row.candidate_name || asin;
    const img = card?.imageUrl || "";
    const link = card?.detailUrl || `https://www.amazon.co.jp/dp/${asin}`;
    md += `##### ${title}\n\n`;
    if (img) md += `![thumb](${img})\n\n`;
    md += `- ASIN: \`${asin}\` · \`asin_review\`: ${row.asin_review || "-"}\n`;
    if (row.brand || row.category) md += `- ${row.brand} / ${row.category}\n`;
    md += `- [Amazon で開く](${link}) · [根拠 URL](${row.source_url || link})\n`;
    if (row.amazon_match_note) md += `- メモ: ${row.amazon_match_note}\n`;
    md += "\n";

    slackMd += `• *${title.slice(0, 120)}*\n  ASIN \`${asin}\` · <${link}|Amazon>`;
    if (row.source_url) slackMd += ` · <${row.source_url}|根拠>`;
    slackMd += "\n";
  }

  if (noAsin.length > 0) {
    md += "#### ASIN 未取得（`scope.amazon_keywords` または Amazon 直リンクを追加）\n\n";
    slackMd += `\n*ASIN 未取得*\n`;
    for (const row of noAsin) {
      md += `- **${row.candidate_name || row.candidate_id}**`;
      if (row.source_url) md += ` — [根拠](${row.source_url})`;
      if (row.amazon_match_note) md += ` — _${row.amazon_match_note}_`;
      md += "\n";
      slackMd += `• ${row.candidate_name || row.candidate_id}`;
      if (row.source_url) slackMd += ` <${row.source_url}|根拠>`;
      slackMd += "\n";
    }
    md += "\n";
  }

  appendSummary(md);
  await postSlackMarkdown(slackMd);

  console.log(
    `digest: JST ${todayJst} — ${todays.length} row(s), ASINあり ${withAsin.length}, なし ${noAsin.length}`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
