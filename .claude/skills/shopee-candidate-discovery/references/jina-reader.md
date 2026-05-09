---
title: Jina Reader（r.jina.ai）運用メモ
---

# 概要

**Jina Reader** は、任意の `http(s)` URL のページを取得し、**LLM 向けの Markdown（＋メタデータ行）**として返すサービスです。本リポジトリでは **`scripts/shopee-candidate-discover-from-scope.mjs`** から、**`scope.source_url` が Amazon 商品直リンクでないとき**に呼び出し、

- **`candidate_name`** のたたき台（Reader が返す `Title:` または見出し）
- **`amazon_keywords` が空のときの PA-API 検索語**（`brand` + タイトルを短く連結した推測クエリ）
- **`amazon_match_note`** の `[Jina 抜粋]`（本文の先頭付近を短く切り出し）

に使います。

## 呼び出し形式（公式）

- **HTTP GET** で次の URL にアクセスします（ターゲット URL を **パスとしてそのまま** 連結）。

  `https://r.jina.ai/https://example.com/article`

- 認証（任意）: リクエストヘッダー

  `Authorization: Bearer <JINA_API_KEY>`

  キーなしでも利用できるが、**キーありの方がレート上限が緩い**旨がドキュメントに書かれていることが多い（細目は [Reader API ドキュメント](https://r.jina.ai/docs) を正本とする）。

- 返却本文の先頭に、`Title:` / `URL Source:` / `Markdown Content:` などの行が付くことが多い。実装は `Markdown Content:` 以降を **本文**として抜粋に使う。

## 無料・レート

- コミュニティ向けに **無料で使える**経路がある（公式の説明・提供形態は変わりうるため、常に [jina.ai](https://jina.ai/) / `r.jina.ai` の最新情報を確認する）。
- **連続大量リクエストは避ける**: Actions では **1 ランあたりの Reader 呼び出し上限**（既定 **10**）と、**呼び出し間隔（約 1.8 秒）**を入れている。環境変数 `JINA_READER_MAX_PER_RUN` で上げられるが、**40 を上限**にクランプしている。

## 実装側の補足（ノイズ対策）

- `scripts/lib/jina-reader.mjs` の **`isLikelyFetchFailure`** … 403 / Forbidden / 「ご迷惑をおかけ」などを含む本文は **PA 用の自動検索語に使わない**。
- **`isGenericStoreTitle`** … `All Products` や英語の一覧系タイトルだけのときも **自動検索語を出さない**（`amazon_keywords` 手入力を促す）。
- `discover-from-scope` が `ledger.amazon_match_note` に **理由の一文**を足すことがある。

## 本リポジトリの環境変数

| 変数 | 必須 | 説明 |
|------|------|------|
| `JINA_API_KEY` | 任意 | `Authorization: Bearer` に渡す。無くても Reader は動く想定。 |
| `JINA_READER_DISABLED` | 任意 | `1` / `true` / `yes` で **Reader を完全スキップ**。 |
| `JINA_READER_MAX_PER_RUN` | 任意 | 1 回の discover で Reader を叩く最大回数（既定 `10`、最大 `40`）。 |

GitHub Actions では Secret 名 **`JINA_API_KEY`** を `discover-from-scope` ステップの環境変数 `JINA_API_KEY` に渡す（任意）。

## 注意（制限・リスク）

- **ターゲットサイトの利用規約・robots**は Reader 経由でも変わらない。公式・ブログ等の許容範囲で使う。
- **ログイン必須・ペイウォール**のページは本文が取れないことが多い。
- **JavaScript 前提のレンダリング**では、取得内容が期待と異なる場合がある（`X-Wait-For-Selector` 等のヘッダは [公式](https://r.jina.ai/docs) を参照）。
- **推測クエリ（Jina + brand）による PA-API 先頭ヒットは誤突合があり得る**ため、`asin_review=pending` を必ず人間が確認する。

## 公式リンク

- [Jina Reader API ドキュメント](https://r.jina.ai/docs)
- [OpenAPI JSON](https://r.jina.ai/openapi.json)（エンドポイントやヘッダの機械可読な正本）
