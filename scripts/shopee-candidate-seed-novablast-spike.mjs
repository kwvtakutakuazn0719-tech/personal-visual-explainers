/**
 * 試験用: `product_queue` に ASICS NOVABLAST 5 SUNNY SIZZLE の1行を入れる（dedupe_key 重複時は追記しない）。
 * PA-API があれば `product_image_url` を GetItems のメイン画像で埋める。
 *
 * 環境変数:
 *   SPREADSHEET_ID, GOOGLE_SERVICE_ACCOUNT_JSON
 *   SPIKE_NOVABLAST_ASIN … 省略時 B0FNBNQ634（SUNNY SIZZLE 専用でなければ差替）
 *   AMAZON_PA_API_* … 任意（画像取得）
 */

import { google } from "googleapis";
import { getItemsCardFields, isPaapiConfigured } from "./lib/amazon-paapi-jp.mjs";

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const rawJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
const SHEET = "product_queue";
const DEDUPE = "asics||novablast 5 sunny sizzle";
const ASIN = (process.env.SPIKE_NOVABLAST_ASIN || "B0FNBNQ634").trim().toUpperCase();

async function getSheets() {
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

  const sheets = await getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET}!A1:J200`,
  });
  const rows = res.data.values ?? [];
  if (rows.length === 0) {
    console.error(`Sheet "${SHEET}" missing. Run: npm run shopee-sheet:bootstrap`);
    process.exit(1);
  }

  const header = rows[0].map((c) => String(c ?? "").trim().toLowerCase());
  const dkCol = header.indexOf("dedupe_key");
  if (dkCol < 0) {
    console.error("product_queue: missing dedupe_key column");
    process.exit(1);
  }

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r] ?? [];
    if (String(row[dkCol] ?? "").trim().toLowerCase() === DEDUPE) {
      console.log("seed: same dedupe_key already exists — delete that row to re-seed, or change dedupe_key.");
      if (isPaapiConfigured()) {
        const imgCol = header.indexOf("product_image_url");
        if (imgCol >= 0 && !String(row[imgCol] ?? "").trim()) {
          const m = await getItemsCardFields([ASIN]);
          const url = m.get(ASIN)?.imageUrl;
          if (url) {
            const row1 = r + 1;
            const L = String.fromCharCode(65 + imgCol);
            await sheets.spreadsheets.values.update({
              spreadsheetId: SPREADSHEET_ID,
              range: `${SHEET}!${L}${row1}`,
              valueInputOption: "USER_ENTERED",
              requestBody: { values: [[url]] },
            });
            console.log("seed: filled empty product_image_url via PA-API");
          }
        }
      }
      return;
    }
  }

  let maxSeq = 0;
  const seqCol = header.indexOf("seq");
  if (seqCol >= 0) {
    for (let r = 1; r < rows.length; r++) {
      const v = Number.parseInt(String(rows[r][seqCol] ?? ""), 10);
      if (Number.isFinite(v)) maxSeq = Math.max(maxSeq, v);
    }
  }
  const nextSeq = maxSeq + 1;

  let imageUrl = "";
  if (isPaapiConfigured()) {
    const m = await getItemsCardFields([ASIN]);
    imageUrl = m.get(ASIN)?.imageUrl || "";
  }

  const today = new Date().toISOString().slice(0, 10);
  const newRow = header.map((h) => {
    switch (h) {
      case "seq":
        return String(nextSeq);
      case "brand":
        return "ASICS";
      case "product_name":
        return "NOVABLAST 5 SUNNY SIZZLE";
      case "release_date":
        return "2025-04-01";
      case "product_image_url":
        return imageUrl;
      case "asin":
        return ASIN;
      case "dedupe_key":
        return DEDUPE;
      case "amazon_listed_at":
        return today;
      case "slack_notified_at":
        return "";
      case "notes":
        return "試験行。SUNNY SIZZLE専用でなければ SPIKE_NOVABLAST_ASIN。画像はPA-APIまたは手入力。";
      default:
        return "";
    }
  });

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET}!A1`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [newRow] },
  });

  console.log(
    `seed: appended seq=${nextSeq} ASIN=${ASIN} image=${imageUrl ? "ok(PA-API)" : "EMPTY→notifyはスキップされる。PA-APIか手で画像URLを入れる"}`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
