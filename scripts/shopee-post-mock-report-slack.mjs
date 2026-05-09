/**
 * 図解モック画像を Slack Incoming Webhook に1枚投稿する（手動テスト用）。
 * 画像は GitHub raw（main の output/shopee-slack-report-mock.png）を参照する。
 *
 * 環境変数: SLACK_WEBHOOK_URL 必須
 * 任意: MOCK_IMAGE_URL（省略時は下記 raw URL）
 */

const DEFAULT_RAW =
  "https://raw.githubusercontent.com/kwvtakutakuazn0719-tech/personal-visual-explainers/main/output/shopee-slack-report-mock.png";

const url = process.env.SLACK_WEBHOOK_URL;
const imageUrl = (process.env.MOCK_IMAGE_URL || DEFAULT_RAW).trim();

if (!url) {
  console.error("Set SLACK_WEBHOOK_URL (Incoming Webhook) and re-run.");
  process.exit(1);
}

const body = {
  text: "図解レポート（モック）",
  blocks: [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text:
          "*図解レポート（デザイン試し）*\n`slack-report-visual-spec.md` に沿ったモック画像です。",
      },
    },
    {
      type: "image",
      title: { type: "plain_text", text: "新着候補レポート（モック）" },
      image_url: imageUrl,
      alt_text: "Shopee candidate report mock dark theme",
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `画像URL: ${imageUrl.slice(0, 80)}…`,
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
