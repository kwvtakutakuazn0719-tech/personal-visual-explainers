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

**まだ自動ではない部分**: 候補の発掘・Amazon 突合・`ledger` への新規行追加は、次の拡張として別ジョブまたは外部ツールに繋ぐ（人間は ASIN の採否など判断だけ）。
