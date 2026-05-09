/**
 * `product_queue` のうち、必須列がすべて埋まり `slack_notified_at` が空の行だけ
 * Slack に1回投稿し、通知日時を書き戻す。
 *
 * 必須: seq, brand, product_name, release_date, asin
 * （`product_image_url` は任意・Slack では使わない）
 *
 * 環境変数: SPREADSHEET_ID, GOOGLE_SERVICE_ACCOUNT_JSON, SLACK_WEBHOOK_URL
 */

import { google } from "googleapis";

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const rawJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

const SHEET = "product_queue";
const RANGE = `${SHEET}!A1:J500`;

function colIndex(header, name) {
  const i = header.indexOf(String(name).toLowerCase());
  return i >= 0 ? i : -1;
}

function pick(row, i) {
  return i >= 0 ? String(row[i] ?? "").trim() : "";
}

function isoNow() {
  return new Date().toISOString();
}

async function postSlack(blocks, fallback) {
  const r = await fetch(SLACK_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: fallback.slice(0, 500), blocks }),
  });
  if (!r.ok) throw new Error(`Slack ${r.status} ${await r.text()}`);
}

async function getClient() {
  const credentials = JSON.parse(rawJson);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth: await auth.getClient() });
}

async function main() {
  if (!SPREADSHEET_ID || !rawJson) {
    console.error("Missing SPREADSHEET_ID or GOOGLE_SERVICE_ACCOUNT_JSON");
    process.exit(1);
  }
  if (!SLACK_WEBHOOK_URL) {
    console.error("Missing SLACK_WEBHOOK_URL");
    process.exit(1);
  }

  const sheets = await getClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: RANGE,
  });
  const rows = res.data.values ?? [];
  if (rows.length < 2) {
    console.log(`${SHEET}: no data rows.`);
    return;
  }

  const header = rows[0].map((c) => String(c ?? "").trim().toLowerCase());
  const ix = {
    seq: colIndex(header, "seq"),
    brand: colIndex(header, "brand"),
    product_name: colIndex(header, "product_name"),
    release_date: colIndex(header, "release_date"),
    asin: colIndex(header, "asin"),
    slack_notified_at: colIndex(header, "slack_notified_at"),
  };
  for (const k of ["seq", "brand", "product_name", "release_date", "asin", "slack_notified_at"]) {
    if (ix[k] < 0) {
      console.error(`product_queue: missing column "${k}"`);
      process.exit(1);
    }
  }

  let notified = 0;
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r] ?? [];
    const seq = pick(row, ix.seq);
    const brand = pick(row, ix.brand);
    const product_name = pick(row, ix.product_name);
    const release_date = pick(row, ix.release_date);
    const asin = pick(row, ix.asin);
    const slack_notified_at = pick(row, ix.slack_notified_at);

    if (slack_notified_at) continue;
    if (!seq || !brand || !product_name || !release_date || !asin) continue;

    const dp = `https://www.amazon.co.jp/dp/${asin}`;
    const blocks = [
      {
        type: "header",
        text: { type: "plain_text", text: `新着候補 #${seq}`, emoji: true },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text:
            `*ブランド* ${brand}\n` +
            `*商品名* ${product_name}\n` +
            `*発売開始日* ${release_date}\n` +
            `*ASIN* \`${asin}\`\n` +
            `<${dp}|Amazon.jp で開く>`,
        },
      },
    ];

    await postSlack(blocks, `新着 #${seq} ${brand} ${product_name} ${dp}`);

    const row1 = r + 1;
    const colLetter = String.fromCharCode("A".charCodeAt(0) + ix.slack_notified_at);
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET}!${colLetter}${row1}`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [[isoNow()]] },
    });

    notified += 1;
    console.log(`notify: row ${row1} seq=${seq} ASIN=${asin}`);
  }

  if (notified === 0) {
    console.log("notify: no complete+unsent rows (need seq, brand, product_name, release_date, asin + SLACK).");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
