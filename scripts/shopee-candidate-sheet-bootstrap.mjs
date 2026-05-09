/**
 * Google スプレッドシートに scope / ledger / asin_attempts を用意し、1行目をヘッダにする（冪等）。
 * 人間が手でブックを作ったあと、共有と Secrets を入れれば GitHub Actions から毎回叩ける。
 *
 * 環境変数:
 *   SPREADSHEET_ID              対象スプレッドシートの ID（URL の /d/ のあと）
 *   GOOGLE_SERVICE_ACCOUNT_JSON サービスアカウント鍵の JSON 文字列（GitHub Secret にそのまま）
 *
 * 事前: そのサービスアカウントのメールに、スプレッドシートを「編集者」で共有する。
 */

import { google } from "googleapis";

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const rawJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

const HEADERS = {
  scope: [
    "category",
    "brand",
    "source_type",
    "source_url",
    "priority",
    "notes",
    "amazon_keywords",
  ],
  ledger: [
    "candidate_id",
    "category",
    "brand",
    "candidate_name",
    "source_url",
    "signal_type",
    "confidence_note",
    "discovered_at",
    "status",
    "current_asin",
    "asin_review",
    "asin_reject_reason",
    "first_reject_at",
    "next_asin_reseek_at",
    "asin_reseek_deadline",
    "asin_reseek_attempts",
    "amazon_match_note",
    "model_code",
    "variant_note",
    "updated_at",
    "updated_by",
    "cancel_reason",
  ],
  asin_attempts: [
    "candidate_id",
    "attempt_no",
    "asin",
    "verdict",
    "reason",
    "checked_at",
    "checked_by",
  ],
  /** 新着〜Amazon初出品までの「一覧・通知ゲート」（product-pipeline-concise.md） */
  product_queue: [
    "seq",
    "brand",
    "product_name",
    "release_date",
    "product_image_url",
    "asin",
    "dedupe_key",
    "amazon_listed_at",
    "slack_notified_at",
    "notes",
  ],
};

function needHeaders(currentFirstRow, expected) {
  if (!currentFirstRow || currentFirstRow.length === 0) return true;
  const a = currentFirstRow.map((c) => String(c ?? "").trim());
  const b = expected.map((c) => String(c ?? "").trim());
  if (a.length !== b.length) return true;
  for (let i = 0; i < b.length; i++) {
    if (a[i] !== b[i]) return true;
  }
  return false;
}

async function main() {
  if (!SPREADSHEET_ID || !rawJson) {
    console.error(
      "Missing SPREADSHEET_ID or GOOGLE_SERVICE_ACCOUNT_JSON",
    );
    process.exit(1);
  }

  let credentials;
  try {
    credentials = JSON.parse(rawJson);
  } catch {
    console.error("GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON");
    process.exit(1);
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const authClient = await auth.getClient();
  const sheets = google.sheets({ version: "v4", auth: authClient });

  const { data } = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  const existing = new Map(
    (data.sheets ?? []).map((s) => [s.properties.title, s.properties.sheetId]),
  );

  const toCreate = [];
  for (const title of Object.keys(HEADERS)) {
    if (!existing.has(title)) toCreate.push(title);
  }

  if (toCreate.length > 0) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: toCreate.map((title) => ({
          addSheet: { properties: { title } },
        })),
      },
    });
    console.log("Created sheets:", toCreate.join(", "));
  }

  const { data: data2 } = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID,
  });
  const titleToId = new Map(
    (data2.sheets ?? []).map((s) => [s.properties.title, s.properties.sheetId]),
  );

  for (const [title, headerRow] of Object.entries(HEADERS)) {
    const sheetId = titleToId.get(title);
    if (sheetId == null) {
      console.error("Sheet missing after create:", title);
      process.exit(1);
    }

    const range = `${title}!A1:Z1`;
    const read = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range,
    });
    const first = read.data.values?.[0] ?? [];

    if (needHeaders(first, headerRow)) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${title}!A1`,
        valueInputOption: "RAW",
        requestBody: { values: [headerRow] },
      });
      console.log("Wrote headers:", title);
    } else {
      console.log("Headers OK:", title);
    }
  }

  console.log("Bootstrap complete.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
