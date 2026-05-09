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

/** Slack 用: 403・エラーっぽい行を下げる */
function rowLooksLikeNoise(row) {
  const name = String(row.candidate_name ?? "");
  const note = String(row.amazon_match_note ?? "");
  return (
    /403|forbidden|ご迷惑|ページが見つかりません|not found|from scope \(link\)|^from\.\.\./i.test(
      name,
    ) ||
    /403|forbidden|ご迷惑|jina reader 失敗|ブロック疑い/i.test(note)
  );
}

/** @param {Record<string, unknown>[]} blocks Slack Block Kit の blocks */
async function postSlackBlocks(blocks, fallbackText) {
  if (!SLACK_WEBHOOK_URL) return;
  const body = {
    text: fallbackText.slice(0, 500),
    blocks,
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
    await postSlackBlocks(
      [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Shopee 出品候補ダイジェスト*（JST ${todayJst}）\n本日の \`discovered_at\` に該当する ledger 行はありません。`,
          },
        },
      ],
      `Shopee 候補 ${todayJst} 本日分なし`,
    );
    return;
  }

  const withAsin = todays.filter((x) => x.current_asin);
  const noAsin = todays.filter((x) => !x.current_asin);

  const asins = withAsin.map((x) => x.current_asin);
  const cardMap = await getItemsCardFields(asins);

  md += "#### カード（ASIN あり）\n\n";
  const slackBlocks = [];

  slackBlocks.push({
    type: "section",
    text: {
      type: "mrkdwn",
      text: `*Shopee 出品候補ダイジェスト*（JST ${todayJst}）\n_ASIN あり ${withAsin.length}件 / なし ${noAsin.length}件_`,
    },
  });

  if (withAsin.length === 0 && noAsin.length > 0) {
    const pa = isPaapiConfigured() ? "PA-API の Secrets は入っています。" : "*PA-API の Secrets が未設定*の可能性が高いです（未設定だと ASIN は取れません）。";
    const tip =
      `*いまの内容が薄いときのチェック*\n` +
      `• ${pa}\n` +
      `• \`scope\` の URL は *店トップ*より *記事・新作一覧・検索結果1ページ* の方が Jina / 検索が効きます。\n` +
      `• 列 \`amazon_keywords\` に *「ブランド + 型番 + 品目」* を手で入れると精度が一番上がります。\n` +
      `• 詳細は GitHub の同じランの *Job Summary*（全文）を見てください。`;
    slackBlocks.push({ type: "section", text: { type: "mrkdwn", text: tip } });
    md += "#### 今日は ASIN ゼロのときのヒント\n\n";
    md += `${pa}\n\n`;
    md += "- `scope` の URL は **記事・一覧の1ページ** に寄せる\n";
    md += "- **`amazon_keywords`** に型番＋品目を書く\n";
    md += "- **Amazon の `/dp/ASIN` 直リンク**を `source_url` に置く\n\n";
  }

  let slackAsinLines = "";
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

    slackAsinLines += `• *${title.slice(0, 120)}*\n  ASIN \`${asin}\` · <${link}|Amazon>`;
    if (row.source_url) slackAsinLines += ` · <${row.source_url}|根拠>`;
    slackAsinLines += "\n";
  }
  if (slackAsinLines) {
    slackBlocks.push({
      type: "section",
      text: { type: "mrkdwn", text: `*ASIN あり*\n${slackAsinLines.trimEnd()}` },
    });
  }

  if (noAsin.length > 0) {
    md += "#### ASIN 未取得（`scope.amazon_keywords` または Amazon 直リンクを追加）\n\n";
    for (const row of noAsin) {
      md += `- **${row.candidate_name || row.candidate_id}**`;
      if (row.source_url) md += ` — [根拠](${row.source_url})`;
      if (row.amazon_match_note) md += ` — _${row.amazon_match_note}_`;
      md += "\n";
    }
    md += "\n";

    const sorted = [...noAsin].sort((a, b) => {
      const na = rowLooksLikeNoise(a) ? 1 : 0;
      const nb = rowLooksLikeNoise(b) ? 1 : 0;
      return na - nb;
    });
    const slackMax = 6;
    const head = sorted.filter((r) => !rowLooksLikeNoise(r)).slice(0, slackMax);
    const tail = sorted.filter((r) => rowLooksLikeNoise(r));
    const shown = head.length > 0 ? head : sorted.slice(0, slackMax);
    let slackNo = "*ASIN 未取得（抜粋）*\n";
    for (const row of shown) {
      const label = String(row.candidate_name || row.candidate_id).slice(0, 100);
      slackNo += `• ${label}`;
      if (row.source_url) slackNo += ` <${row.source_url}|根拠>`;
      slackNo += "\n";
    }
    const hidden = noAsin.length - shown.length;
    const noiseCount = tail.length;
    if (hidden > 0) {
      slackNo += `\n_他 ${hidden} 件は省略（403/一覧/ノイズは下位）。全体は Job Summary かスプシ \`ledger\` を参照。_`;
    } else if (noiseCount > 0 && head.length > 0) {
      slackNo += `\n_403/エラーっぽい行は ${noiseCount} 件あり（ledger で確認）。_`;
    }
    slackBlocks.push({
      type: "section",
      text: { type: "mrkdwn", text: slackNo.slice(0, 2900) },
    });
  }

  appendSummary(md);
  await postSlackBlocks(slackBlocks, `Shopee 候補 ${todayJst} ASINあり${withAsin.length}`);

  console.log(
    `digest: JST ${todayJst} — ${todays.length} row(s), ASINあり ${withAsin.length}, なし ${noAsin.length}`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
