/**
 * Slack へ「Amazon URL 中心」のモック通知（手動テスト用・画像なし）。
 *
 * 環境変数: SLACK_WEBHOOK_URL 必須
 * 任意: MOCK_ASIN（既定 B0FNBNQ634）
 */

const url = process.env.SLACK_WEBHOOK_URL;
const asin = (process.env.MOCK_ASIN || "B0FNBNQ634").trim().toUpperCase();
const dp = `https://www.amazon.co.jp/dp/${asin}`;

if (!url) {
  console.error("Set SLACK_WEBHOOK_URL (Incoming Webhook) and re-run.");
  process.exit(1);
}

const body = {
  text: `新着候補（モック） ${asin}`,
  blocks: [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text:
          `*新着候補（モック）*\n` +
          `• ブランド: ASICS\n` +
          `• 商品名: NOVABLAST 5 SUNNY SIZZLE\n` +
          `• 発売: 2025-04-01\n` +
          `• ASIN: \`${asin}\`\n` +
          `• <${dp}|Amazon.jp で開く>`,
      },
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: "画像は使わず URL 通知。本番は `notify-product-ready` と同趣旨。",
        },
      ],
    },
  ],
};

const r = await fetch(url, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

if (!r.ok) {
  console.error(await r.text());
  process.exit(1);
}
console.log("Slack OK:", r.status);
