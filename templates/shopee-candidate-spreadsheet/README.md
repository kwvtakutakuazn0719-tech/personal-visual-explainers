# Shopee 候補台帳用テンプレ（CSV）

Google スプレッドシートはこちらからあなたのアカウント上には作れないため、**CSV を用意した**。取り込めば列付きのシートになる。

## 手順（約1分）

1. [Google スプレッドシート](https://sheets.google.com) で **新規**を作成する。
2. 下の名前で **シート（タブ）** を用意する: `scope` / `ledger` /（任意）`asin_attempts`
3. 各タブを開き、**ファイル → インポート → アップロード** で対応する CSV を選ぶ。
   - **インポート場所**: 「現在のシートを置き換える」（そのタブを選んだ状態で実行）
4. `scope` の `example.com` の行は削除して、実際の URL に差し替える。

## ファイル

| ファイル | 貼るタブ名 |
|----------|------------|
| `scope.csv` | `scope` |
| `ledger.csv` | `ledger` |
| `asin_attempts.csv` | `asin_attempts`（任意） |

列の意味は `.claude/skills/shopee-candidate-discovery/references/ledger-schema.md` を正本とする。

---

## 自動で維持したい場合（推奨・今後ずっと）

手で CSV を入れなくてよい。**空のスプレッドシートを1回だけ作り**、サービスアカウントに共有したうえで GitHub Secrets を入れると、**毎日 06:00 JST の Actions** が `npm run shopee-sheet:bootstrap` を実行し、**タブとヘッダを自動で揃える**。

手順の詳細: `.claude/skills/shopee-candidate-discovery/references/github-actions-schedule.md`

**自動で動く部分（Actions）**: `scope` → `ledger` への取り込み、`source_url` が Amazon 直リンクなら ASIN 抽出、列 **`amazon_keywords`** があれば **PA-API** で先頭 ASIN を突合（Secrets 要）。その後 **本日分ダイジェスト**を Job Summary（＋任意で Slack）に出す。

**人間が触る部分**: `asin_review` の採否（同一 ASIN でもバリアント違いがあり得るため）。

`scope` の `amazon_keywords` は「ブログ URL と別に、Amazon 検索に投げる語句（ブランド＋型番など）」を入れる想定。
