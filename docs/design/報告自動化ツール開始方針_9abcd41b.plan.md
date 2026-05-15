---
name: 報告自動化ツール開始方針
overview: Shopeeの売上・注文・精算などをもとに、無機質な日報・週報・月報で状況把握、経営方針決定、TODO設定を支援する運用ツールの開始方針を整理します。別人格の経営コンサルタントスキルによるレビュー工程を組み込み、レポート草案→レビュー→修正→Slack報告の流れを初期版から前提にします。
todos:
  - id: decide-location
    content: 別リポジトリで始めるか、このリポジトリの `apps/` 配下で始めるかを確定する
    status: pending
  - id: verify-shopee-api
    content: Shopee Open Platformで日報・週報・月報に必要なデータ、認証方式、事前準備を確認する
    status: pending
  - id: decide-core-scope
    content: 初期版の主目的を日報・週報・月報ベースの状況把握とTODO設定に固定し、チャット通知は後回しにする
    status: pending
  - id: define-data-model
    content: 日報・週報・月報・TODO提案・方針提案のデータ項目を型として固定する
    status: pending
  - id: define-kpis
    content: 日報・週報・月報に最初から入れる経営改善向け指標を固定する
    status: pending
  - id: design-todo-checkin
    content: TODO実施報告の入力方式、タイミング、次回レポートへの反映ルールを設計する
    status: pending
  - id: design-capacity-profile
    content: 週次・月次の体制/作業時間/実行余力プロファイルの回収方法と、TODO・方針レビューへの反映ルールを設計する
    status: pending
  - id: design-accountability-loop
    content: 週次・月次の達成度報告、約束、採点、見直しの仕組みを設計する
    status: pending
  - id: design-review-loop
    content: 無機質な報告ツールと、別人格の経営コンサルタントスキルのレビュー分担を設計する
    status: pending
  - id: create-consultant-skill-plan
    content: 経営コンサルタントレビュー用の別スキルをどの構成で作るか整理する
    status: pending
  - id: create-todo-review-skill-plan
    content: TODOレビュー用の別人格スキルをどのプロフェッショナル像で作るか整理する
    status: pending
  - id: create-reality-auditor-skill-plan
    content: 週次・月次で出現する現実監査官スキルの役割、入力、出力、出現頻度を整理する
    status: pending
  - id: restructure-by-ssot
    content: 報告ツール全体を SSoT 観点で再分解し、SKILL.md と references/ とコードの責務境界を整理する
    status: pending
  - id: build-mvp
    content: Shopeeデータ取得→集計→レポート生成→TODO提案の手動実行MVPを作る
    status: pending
  - id: add-scheduling
    content: 日報・週報・月報の定期実行を追加する
    status: pending
  - id: add-ai-analysis
    content: 安定稼働後にAI要約・方針提案・TODO優先順位づけの精度を上げる
    status: pending
isProject: false
---

# 報告自動化ツールの開始方針

## 結論
`新しいフォルダを作って始める` のがよいです。しかも今回は、既存の図解中心リポジトリに機能を継ぎ足すより、**独立したツールとして分離**する方が安全です。

理由:
- このリポジトリは図解スキル中心です。`[README](C:/Users/party/src/personal-visual-explainers/README.md)` でも、主役は `[.claude/skills/](C:/Users/party/src/personal-visual-explainers/.claude/skills/)`、生成物は `[output/](C:/Users/party/src/personal-visual-explainers/output/)` と整理されています。
- `[package.json](C:/Users/party/src/personal-visual-explainers/package.json)` は最小構成で、一般的なアプリ基盤はまだありません。
- 現在の作業ツリーにも既存変更が多く、ここに直接混ぜると混線しやすいです。

## おすすめの置き方
優先順位は次の通りです。

1. **最善**: 別リポジトリとして新規作成する
2. **次善**: このリポジトリを使うなら、トップレベルに独立フォルダを切る

このリポジトリ内で進めるなら、たとえば次のように分けます。
- `[apps/shopee-reporting-assistant/](C:/Users/party/src/personal-visual-explainers/apps/shopee-reporting-assistant/)`
- 図解提出物は別枠で `[output/](C:/Users/party/src/personal-visual-explainers/output/)` か、必要なら後で専用の提出用HTMLを作る

`[.claude/skills/](C:/Users/party/src/personal-visual-explainers/.claude/skills/)` 配下に置くのは、今回の本体が「Cursorの新スキル」そのものである場合だけに留めるのが無難です。今回は `Shopee API + 定期実行 + Slack通知 + AI提案` の実アプリ寄りなので、`.claude/skills` には入れない前提で進めます。

## 現時点の方針まとめ
今の優先順位は次の通りです。

1. 主目的は `日報・週報・月報` による状況把握、経営方針決定、TODO設定
2. 上流に `データコモディティ` を置き、日次データ・方針・TODO・結果を無判断で蓄積する
3. 報告ツール本体は `無機質・客観的・再現性重視` で作る
4. 別人格の `TODOレビュー役スキル`、`経営コンサルタントスキル`、`現実監査官スキル` で多面的にレビューし、判断の偏りを補正する
5. チャット通知は有用だが、**後から追加する補助機能**
6. `レポート -> TODO -> 実施報告 -> 次回レポート反映` の循環を最初から設計する
7. `体制・確保可能時間・実行余力` も週次・月次で把握し、TODOと方針の現実性を補正する
8. 週次・月次では `達成度報告` を必須にし、約束・採点・見直しの循環を作る
9. 初期版では、まず `日報` を完成させてから `週報` `月報` へ広げる

## このツールの目的
このツールの目的は、Shopee の事業運営について次を支援することです。

1. `日報・週報・月報` による状況把握
2. `データコモディティ` による事実・方針・結果の継続蓄積
3. データと制約に基づく `TODO生成`
4. `TODO実施報告` と `持ち越し管理`
5. `経営方針の見直し`
6. `長期視点・生活影響の可視化`

言い換えると、単なるレポート配信ではなく、
`事実収集 / 蓄積 -> 草案作成 -> 別人格レビュー -> 実施報告 -> 次回反映`
の循環を作ることが主目的です。

## データコモディティの位置づけ
`データコモディティ` は、判断者でもレビュー役でもなく、`ただ存在する観測・蓄積の正本` として置く。

`データコモディティ` は3面を持つものとして扱う。

1. `Shopee由来データ面`
   - Shopee API から得た生データや、その機械的集計結果を蓄積する
   - 正規化スナップショットを正本とし、生レスポンスは補助扱いにする
   - 販売モデル前提: 無在庫販売（Amazon在庫連動）のため、Shopeeの在庫数は実態を反映しない
   - 参照用として在庫数は保持するが、低在庫アラートなどの判断には使わない
   - このモデル固有の重要指標を追加する:
     - `unshippedCountByDeadlineRisk`: 発送期限別の未発送件数
     - `cancelledCount` / `estimatedCancelCost`: キャンセル件数と推定費用
     - `returnCount` / `estimatedReturnCost`: 返品件数と推定費用
     - `estimatedMarginPerOrder`: 注文あたりの推定利益
   - 広告費・アフィリエイト費用は経営戦略上の重要指標として正式追加する:
     - `adSpendDaily`: 日次広告費（Shopee Ads API から取得。`getAllCpcAdsDailyPerformance` 等）
     - `adSpendByCampaign`: キャンペーン別広告費（オプション）
     - `affiliateCost`: アフィリエイト費用（取得可否を実フィールド確認フェーズで検証）
     - `estimatedNetProfit`: 広告費・アフィリエイト費用・手数料を差し引いた実質利益（推定）
   - 取得できない場合の設計方針: 広告費・アフィリエイト費用は `nullable` として扱い、取得できない場合は空欄で記録する。将来取得可能になった時点で自動的に埋まる設計にする
   - 返品補償ルール（スキャン完了後キャンセル・返品の半額補償、上限150ドル、数か月後支払い）は複雑なため、別途しかるべきタイミングで詳細設計する

2. `ツール内導出データ面`
   - このツール全体が導き出した `情報` を蓄積する
   - `reportDraft`: 生成した草案
   - `finalReport`: 最終版レポート
   - `publishedUrl`: surge公開URL
   - `slackMessageTs`: Slack投稿タイムスタンプ
   - `generatedTodos`: 生成したTODO一覧
   - `todoCheckinResults`: 12時チェックイン結果（status + memo）
   - `carryoverTodos`: 持ち越しTODO
   - `reviewInputPack`: 各レビュー役に渡した入力パック
   - `reviewOutputs`: 各レビュー役の出力
   - `adjudicationLog`: 裁定記録（採用・一部採用・不採用・保留）
   - `finalAdoptedChanges`: 最終採用内容
   - `activeFocusThemes`: その時点の重点テーマ
   - `weeklyCommitment`: 週次の約束と達成度
   - `monthlyCommitment`: 月次の約束と達成度
   - `weeklyCapacityProfile`: 週次の実行余力プロファイル
   - `monthlyCapacityProfile`: 月次の実行余力プロファイル
   - `lifeProfile`: 初回設定した生活目標プロファイル（変更頻度は極めて低い）

3. `外部ツール由来データ面`（第3面）
   - 競合分析ツールなど、将来開発される外部ツールからのデータを受け取る
   - 現時点では空だが、受け口（テーブル）だけ先に用意する
   - テーブル: `external_tool_snapshots`（date / tool_name / data_type / payload JSON / created_at）
   - 外部ツールは「このテーブルに書き込むだけ」でよい
   - 報告ツールは「データがあれば使う、なければスキップ」という設計
   - この設計により、競合分析ツール以外の将来ツール（Amazon在庫監視・為替レート等）も同じ口から接続できる

この3面を分ける理由:
- `外部から来た事実` と `内部で積み上がった情報` と `外部ツールが生成した事実` を混ぜないため
- 後から見たときに、`その日の現実` と `その現実から何を決めたか` を分離して追えるようにするため
- `報告ツールちゃん` や各レビュー役が、どの層の材料を見ているかを明確にするため
- 外部ツールが壊れても報告ツール本体が止まらないようにするため

役割:
- 毎日の事実データを蓄積する
- その時点で有効だった方針を蓄積する
- 出したTODOと実施結果を蓄積する
- 持ち越しTODO、約束、達成度、公開URLを蓄積する
- 後段の `報告ツールちゃん` や各レビュー役に、解釈前の観測材料を渡す

やらないこと:
- レビュー
- 判断
- 提案
- 警告
- 優先順位づけ

整理すると、`データコモディティ` は `考える役` ではなく `残す役` である。

## 何がどのくらい決まったか
### ほぼ決まったこと
- 主目的は `日報・週報・月報` を中心にした運営支援
- 通知先は `Slack`
- 毎日12時に `TODO実施報告` を回収する
- TODO実施報告は `選択式 + 短いメモ`
- `実行余力プロファイル` を週次・月次で回収する
- 上流に `データコモディティ` を置き、観測履歴を正本として残す
- レビュー役は `TODOレビュー役`、`経営コンサルタント`、`現実監査官`
- `現実監査官` は週次・月次のみ出現する
- `売上速報` と `回収見込み` は分けて扱う

### 方向性は固まったが、詳細未確定
- Slack UI の最終形
- 目標プリセットの正式一覧
- 各レビュー役への厳密な入力/出力フォーマット
- 初回プロフィール入力の実際のフォーム設計
- GitHub Actions / 常時サーバー / self-hosted のどれで動かすか

### まだ実装前に確認が必要なもの
- Shopee API の実フィールドと可用性
- Slack App の権限とインタラクションの最終仕様
- Payment / Escrow からどこまで確定寄り数字を引けるか

## SSoT観点の見直し
現時点の設計メモは、`計画書としては有用` ですが、**このまま SKILL.md に変換すると過剰に肥大化し、SSoT違反の温床になります。**

特に注意点:
- 現在の設計メモは 500 行を大きく超えており、SKILL.md にそのまま置くには長すぎる
- 同じ概念が複数箇所に繰り返し現れ始めている
  - 例: レビュー役の説明、TODO運用思想、現実監査官の目的、週次/月次の扱い
- 一部の詳細は `設計方針` と `将来の実装案` が混在している

したがって、実装フェーズに入る前に、以下の責務分離が必要です。

### SKILL.md に置くべきもの
- そのスキルが `何をするか`
- `いつ使うか`
- 高レベルの手順
- 必要な参照先へのリンク

### references/ に置くべきもの
- KPI一覧
- 日報 / 週報 / 月報の章立て
- TODO生成ルール
- TODOチェックイン仕様
- 実行余力プロファイル仕様
- 達成度報告仕様
- 各レビュー役の人格定義
- 現実監査官のプロフィール入力仕様

### コードに置くべきもの
- Slack App の対話処理
- Shopee API 取得処理
- 集計ロジック
- TODO状態の保存
- 定期実行
- 型定義、バリデーション、upsert ルール

## 現段階のSSoT判定
### 良い点
- 「報告ツール本体」「TODOレビュー役」「経営コンサルタント」「現実監査官」の責務はかなり分かれてきた
- Slack、Shopee、生活プロフィールなど、入力源も分類できている
- 決定的処理をコードに寄せ、判断をスキルに寄せる方向は合っている

### 危ない点
- この計画書自体は、すでに `1ファイルに多くを詰め込みすぎ` ている
- 今後これをそのまま 1 つの SKILL.md にすると確実に肥大化する
- KPI、人格定義、入力フォーム仕様などを複数 SKILL に重複転記すると SSoT が壊れる

## 再構成方針
実装前に、報告ツール全体は次のように分ける前提で進める。

1. `報告ツールちゃん` の SKILL.md
   - 高レベルの流れだけを書く
2. `references/`
   - レポート仕様
   - 入力仕様
   - レビュー役仕様
   - KPI仕様
3. 必要なら別スキル
   - `執行参謀`
   - `経営コンサルタント`
   - `現実監査官`
4. コード
   - Slack / Shopee / DB / scheduler

この方針なら、`SKILL.md は短く保ち、詳細は references/ に逃がし、決定的処理はコードに置く` という SSoT 原則に沿いやすいです。

## 今後の作業チェックリスト
今後はこのチェックリストを基準に、1つずつ決めて進める。
ユーザーが「リスト」と言ったら、このチェックリストを参照する前提にする。

### 0. 全体方針の固定
- [x] ツールの主目的を `日報・週報・月報による状況把握、TODO設定、方針見直し` に固定する
- [x] 通知先を `Slack` に固定する
- [x] `報告ツールちゃん` を本体名として採用する
- [x] チャット通知は初期版の主機能ではなく、後から追加する補助機能とする

### 1. 全体構成の固定
- [x] 全体フローを `データコモディティ -> 報告ツールちゃん -> TODOレビュー役 -> 12時チェックイン -> 経営コンサルタント -> 現実監査官 -> Slack` と整理する
- [x] `報告ツールちゃん` は無機質な草案作成に徹する方針を固定する
- [x] `TODOレビュー役スキル` の必要性を確定する
- [x] `経営コンサルタントスキル` の必要性を確定する
- [x] `現実監査官スキル` を週次・月次の必須役として確定する

### 1.2. データコモディティ設計
- [x] 上流に `データコモディティ` を置く方針を確定する
- [x] `データコモディティ` はレビュー・判断・提案を行わないと定義する
- [x] `データコモディティ` を `そこにあるだけの観測・蓄積の正本` と定義する
- [x] `データコモディティ` は `Shopee由来データ面` と `ツール内導出データ面` の2面を持つと定義する
- [x] `Shopee由来データ面` の持ち方を `正規化スナップショット正本、生レスポンス補助` に確定する
- [x] `Shopee由来データ面` の正規化スナップショット初版項目一覧を確定する
- [x] `Shopee由来データ面` は今後増減が見込まれる箇所として明示し、変更耐性設計を事前に施す方針を確定する
- [ ] `Shopee由来データ面` の変更耐性設計を実装方針として確定する（スキーマ変更が後段へ波及しにくい分離層の設計）
- [x] `ツール内導出データ面` の正本項目一覧を確定する
- [x] `外部ツール由来データ面`（第3面）を追加し、将来の競合分析ツール等が接続できる受け口を設計する
- [x] `データコモディティ` から `報告ツールちゃん` へ渡す観測パックを確定する（日報・週報・月報ごとに絞り込む方針）
- [x] `データコモディティ` の保持期間 / 履歴単位 / スナップショット粒度を確定する
  - 粒度: 日次スナップショットを正本とし、週次は都度導出（独立保存なし）
  - 保持期間（日次・ツール内導出）: 1年間
  - 保持期間（月次集計サマリー）: 3年間（前年・前々年同月比のため別テーブルで保持）
  - 履歴単位: date キーの1日1レコード（upsert）
  - 1年超レコード: 自動削除 or `archived` フラグで別テーブル退避

観測パック 日報:
- Shopee由来: `orderCount`, `grossRevenue`, `unshippedCount`, `unshippedHighRiskCount`, `cancelledCount`, `estimatedCancelCost`, `returnCount`, `topSkusByRevenue`, `decliningSkusByRevenue`, `adSpendDaily`（nullable）
- ツール内導出: `carryoverTodos`, `todoCheckinResults`（前日分）, `activeFocusThemes`

観測パック 週報:
- Shopee由来: `weeklyOrderCount`, `weeklyGrossRevenue`, `projectedRecovery`, `weeklyUnshippedCount`, `weeklyCancelledCount`, `weeklyReturnCount`, `skuWeeklyRanking`, `weeklyAdSpend`（nullable）, `weeklyAffiliateCost`（nullable）
- ツール内導出: `carryoverTodos`, `todoCheckinResults`（週内全分）, `activeFocusThemes`, `weeklyCapacityProfile`, `weeklyCommitment`

観測パック 月報:
- Shopee由来: `monthlyOrderCount`, `monthlyGrossRevenue`, `projectedRecovery`, `averageOrderValue`, `estimatedMarginPerOrder`, `monthlyCancelledCount`, `monthlyCancelCost`, `monthlyReturnCount`, `monthlyReturnCost`, `returnCompensationPendingAmount`, `skuMonthlyContribution`, `monthlyAdSpend`（nullable）, `monthlyAffiliateCost`（nullable）, `estimatedNetProfit`（nullable）
- ツール内導出: `carryoverTodos`, `todoCheckinResults`（月内全分）, `activeFocusThemes`, `monthlyCapacityProfile`, `monthlyCommitment`, `lifeProfile`

nullable指定の意味: 現時点で取得できない場合は空欄で記録し、将来取得可能になった時点で自動的に埋まる設計にする

### 1.5. レビュー統治設計
- [x] 最終版はレビューワー主導ではなく `報告ツールちゃん` が閉じる方針を確定する
- [x] `報告ツールちゃん` を `名前だけ柔らかい無機質統合器` として定義する
- [x] レビューワーの標準出力を `指摘 + 必要箇所だけ差し替え案` に確定する
- [x] レビュー競合は `報告ツールちゃん` が固定ルールで裁定する方針を確定する
- [x] 競合裁定の基本軸を `論点別優先` に確定する
- [x] 競合裁定に `時間軸ルール` を導入する方針を確定する
- [x] レビュー工程を `ハイブリッド` にする方針を確定する
- [x] `執行参謀` と `経営コンサルタント` を並列レビューにする方針を確定する
- [x] `現実監査官` を最後段に置く方針を確定する
- [x] `現実監査官` の入力範囲を `統合案 + 重要事実` にする方針を確定する
- [x] `論点別優先` の正式ルール表を確定する
- [x] `時間軸ルール` の正式配分を `日報は執行参謀寄り、週報・月報は経営コンサル寄り` に確定する
- [x] `重要事実` の正式入力一覧を確定する
- [x] `採用 / 一部採用 / 不採用 / 保留` の裁定テンプレートを確定する
- [x] `日報 / 週報 / 月報` ごとのレビュー通過順と適用範囲を明文化する
- [x] `報告ツールちゃん` の表現禁止事項 / 口調制約を正式化する

### 2. レポート設計
- [x] 日報・週報・月報を作る方針を確定する
- [x] 日報・週報・月報の基本目的を整理する
- [x] 日報に入れる初版指標の方向性を整理する
- [x] 週報に入れる初版指標の方向性を整理する
- [x] 月報に入れる初版指標の方向性を整理する
- [x] `売上速報` と `回収見込み` を分けて扱う方針を確定する
- [x] 詳細HTMLは `surge.sh` に毎回別URLで公開し、履歴として残す方針を確定する
- [x] 日報の章立てを確定する（情報層を薄く・判断サマリー・TODO・方針を厚く）
- [x] 週報の章立てを確定する（同週比較・4週推移を独立章として追加）
- [x] 月報の章立てを確定する（前年同月比・6ヶ月推移を独立章として追加）
- [x] レポート最終版の Slack 表示形式を `簡易要約 + surge公開HTML` に固定する
- [x] 見やすい詳細HTMLの品質基準として `creating-visual-explainers` スキルを参照する方針を確定する
- [x] 日報 / 週報 / 月報のHTML詳細テンプレート方針を確定する
  - 週報・月報に `競合・市場動向` 章を追加（外部ツールデータがある場合のみ表示）
  - 各TODOに判断根拠・優先順位理由・推定時間を必須表示する
  - 方針章に「なぜ今週/今月これをやるか」の理由を必ず明記する

### 3. TODO運用設計
- [x] TODOは `データ -> ルール -> 優先順位 -> レビュー` で作る方針を確定する
- [x] TODO実施報告を毎日12時に回収する方針を確定する
- [x] TODO実施報告の入力形式を `選択式 + 短い一言メモ` に確定する
- [x] 12時チェックインの対象を `昨日の日報TODO + 未完了の持ち越しTODO` に確定する（今日のTODOはまだ未実施のため昨日分を報告）
- [x] TODO完了状況を次回レポートへ反映する方針を確定する
- [x] 12時チェックインの Slack UI 方式を最終確定する
  - 方式: GitHub Actionsが surge.sh にHTMLフォームを生成・公開し、SlackにURLを送る
  - ユーザーはURLを開いて入力・送信（常時起動サーバー不要）
  - チェックイン対象: 「昨日のTODO」（今日のTODOはまだ未実施のため）
  - 未回答時: 30分後（12:30）にリマインド1回のみ
- [x] TODO生成ルール一覧を日報・週報・月報ごとに確定する
  - 日報: 上限5件・当日中に完結できる粒度・各TODOに根拠・優先理由・推定時間・テーマ紐づけ必須
  - 週報: 上限7件・週内完結・大まかな日程配置付き
  - 月報: 上限10件・月内完結・週配分（第1〜4週）付き
  - 上限超過時は執行参謀が削除・統合する
- [x] 持ち越しTODOの扱いルールを最終確定する
  - 未完了・一部完了は自動的に持ち越し候補
  - 次回レポートで執行参謀が「維持 / 修正 / 削除 / 緊急格上げ」を判定
  - 3回連続持ち越しで執行参謀が根本原因コメントを必須付与・分解/削除/外部依存特定を提案
  - 月またぎの持ち越しは月報で改めて優先度を見直す

### 4. 人間側入力設計
- [x] 目標入力は自由記述ではなく `選択式中心` にする
- [x] 目標は `用途別プリセット` 方式が向くと整理する
- [x] 目標プリセットの正式一覧を確定する
  - 月次売上・利益・広告費率上限・キャンセル率上限・週あたり作業時間上限（全て数値入力）
- [x] 実行余力プロファイルが必要であることを確定する
- [x] 実行余力プロファイルは `週1の簡易確認 + 月1の少し深い確認` とする
- [x] 実行余力プロファイルは `12時チェックイン時に同時回収` とする
- [x] 現実監査官用プロフィールは `初回だけ詳細入力 + 普段はほぼ固定` とする
- [x] 現実監査官プロフィールの数値項目 / 選択式項目の切り分けを整理する
- [x] 実行余力プロファイルの最終質問項目を確定する
  - 週次: 作業時間（数値）・コンディション（1〜5）・エネルギーを奪っているもの・後回しにしていること・今週最大インパクトのアクション・Amazon/競合/Shopee変化
  - 月次: 上記 + うまくいっていないのに放置していること・予想以上にうまくいっていること・来月の心配・トレンド感覚・目標自信度（1〜10）・3ヶ月後目標
- [x] 初回プロフィールフォームの最終質問文を確定する
  - 生活・財務基盤 / 時間・エネルギー / ビジネスビジョン / リスク・制約 の4ブロック構成
  - 「成功した状態」の一文定義・中期ビジョン・絶対にやらないこと・広告費月次上限を含む
- [x] 未入力・未回答時の対応方針を確定する
  - Tier A（補完不可）: 前回値を使用しレポートに明記、3週連続で確認ボタンを出す
  - Tier B（前回値で推定可）: サイレントに補完・直近変化があった場合のみ翌週に確認
  - Tier C（あれば深まる）: スキップ・3回連続で非表示にし月初に再表示
  - 未入力が多い週は分析が自然と浅くなる（ペナルティではなく品質の自然変化）

### 5. 達成度報告・振り返り
- [x] 週次・月次では `達成度報告` を必須にする方針を確定する
- [x] `少し背伸びするが現実的` な目標設定思想を確定する
- [x] `前回の約束に対する結果` を必ず表示する方針を確定する
- [x] 未達理由を分類して扱う方針を確定する
- [x] 週次の約束項目と達成度入力項目を最終確定する
  - 設定: 週報の「来週の方針」章で1〜3件・結果ベース・測定方法付き
  - 報告: 達成 / 一部達成 / 未達成 + 理由カテゴリ（外部要因/時間不足/優先変更/先延ばし/目標高すぎ/情報不足）
  - 3回連続同一理由で執行参謀が構造的問題として指摘する
- [x] 月次の約束項目と達成度入力項目を最終確定する
  - 設定: 月報の「来月の方針」章で2〜4件・数値目標必須・週配分付き
  - 報告: 達成 / 一部達成（何%か）/ 未達成 + 理由カテゴリ + 月内週次推移を自動表示
  - 前回の約束と結果はレポート冒頭に必ず表示・未回答は目立つ形で表示

### 6. 各人格スキル設計
#### 6-1. TODOレビュー役スキル
- [x] プロフェッショナル像を `データドリブン執行参謀` に整理する
- [x] 厳しさを `かなり厳しく` にする方針を確定する
- [x] 出力形式を `ハイブリッド型` にする方針を確定する
- [x] 主なレビュー観点を整理する
- [x] 入力項目を最終確定する
- [x] 出力テンプレートを最終確定する

#### 6-2. 経営コンサルタントスキル
- [x] TODOだけでなく全体方針にも関与する役割に確定する
- [x] 盲点、優先順位、代替戦略までレビューする方針を確定する
- [x] `超データドリブンで理論的` なレビュー方針を整理する
- [x] 入力項目を最終確定する
- [x] 出力テンプレートを最終確定する

`経営コンサルタント` の正式入力セット:
- `重点テーマ/優先順位/方針メモ/主要指標/余力/約束進捗` だけを渡す
- 報告草案全文は渡さない
- `主要指標` は `方針判断に必要な最小限の指標` だけを付与する
- `執行参謀` のレビュー結果は見せない

入力項目の正式内訳:
- `focusThemes`
- `priorityDraft`
- `strategyNotesDraft`
- `strategyEvidenceMetrics`
- `capacityProfile`
- `commitmentProgress`

`経営コンサルタント` の正式出力テンプレート:
1. `keptStrategies`
2. `modifiedStrategies`
3. `rejectedStrategies`
4. `addedStrategies`
5. `reprioritizationReasons`
6. `finalStrategyNotes`

各方針項目で必須にする要素:
- `reasonTag`
- `reasonText`

理由タグの例:
- `priority_misaligned`
- `theme_too_broad`
- `weak_leverage`
- `missing_alternative`
- `capacity_misaligned`
- `commitment_gap_detected`
- `better_focus_available`

#### 6-3. 現実監査官スキル
- [x] `週次・月次のみ出現する必須役` に確定する
- [x] `理論的で現実に刺さる警告役` として定義する
- [x] 生活目標と将来影響を可視化する役割を確定する
- [x] 初回プロフィール入力の必要性を確定する
- [x] 入力項目を最終確定する
- [x] 出力テンプレートを最終確定する

`現実監査官` の正式入力セット:
- `統合案 + 重要事実 + 初回プロフィール + 週次/月次の約束進捗` を渡す
- 対象は `週報` と `月報` のみ
- `重要事実` は `4ブロック構成` とする
  - `salesRecoveryFacts`
  - `todoExecutionFacts`
  - `goalCommitmentFacts`
  - `capacityFreedomFacts`

入力項目の正式内訳:
- `integratedReportDraft`
- `salesRecoveryFacts`
- `todoExecutionFacts`
- `goalCommitmentFacts`
- `capacityFreedomFacts`
- `lifeProfile`
- `commitmentProgress`

`現実監査官` の正式出力テンプレート:
1. `keptRecognitions`
2. `modifiedRecognitions`
3. `rejectedRecognitions`
4. `addedWarnings`
5. `longTermRiskReasons`
6. `finalWarningMemo`

各警告・認識項目で必須にする要素:
- `reasonTag`
- `reasonText`

理由タグの例:
- `living_cost_gap_detected`
- `take_home_gap_detected`
- `asset_delay_risk`
- `free_time_erosion`
- `education_funding_risk`
- `improvement_velocity_too_low`
- `commitment_repeat_miss`

### 7. Slack設計
- [x] Slack通知は `Incoming Webhook` のみで十分と確定する（Bot Token・Interactivity不要）
  - リマインドは12:30に別のGitHub Actionsトリガーが起動しSupabaseを確認して再通知する方式
- [x] チェックイン方式を `surge.sh HTMLフォーム + SlackにURL送信` に変更確定（常時起動サーバー不要）
- [x] レポート通知は `Slackに簡易要約を送信し、詳細は surge.sh 公開HTML のURLへ誘導する` 方針を確定する
- [x] 詳細HTMLの surge 公開は `毎回別URL` とし、Slackにはその回のURLを送る方針を確定する
- [x] 12時チェックインの UI 仕様を最終確定（昨日のTODO確認・HTMLフォーム・未回答30分後リマインド1回）
- [x] 初回プロフィール入力を surge.sh 公開HTMLフォームで行う方針を確定する
- [ ] Slack App に必要な権限・イベントの最終確認（Incoming Webhook権限の確認）
- [x] Slackメッセージ本文の最小内容を定義する（UXレビュー反映）
  - 3行サマリー必須: ①3か国合計注文数と前日比 ②最重要アラート1件（発送期限・キャンセル等） ③当日TODO件数
  - その後にレポートURL（surge.sh）を1行で掲載
- [x] GitHub Actions失敗時のSlackエラー通知を必須要件として追加する（UXレビュー反映）
  - ワークフロー失敗時に「本日のレポートを生成できませんでした: [エラー概要]」をSlackに送信
  - ユーザーが「レポートが届かない」ことに気づけない状態を防ぐ
- [x] チェックインURL再送手段を設計に追加する（UXレビュー反映）
  - チェックインフォームURLをSupabaseに保存しておく
  - 12:30リマインド時に再送するURLはSupabaseから取得する
  - 手動再送手段: 対象日のURLはSupabase `checkin_forms` テーブルを参照する（運用手順としてREADMEに記載）
- [x] チェックイン未回答の最終処理を明示する（UXレビュー反映）
  - 30分後リマインド以降も未回答 → 「無回答」としてSupabaseに記録し、レポート生成は継続する
  - レポートのTODO振り返り章に「昨日のチェックイン: 未回答」と明示表示する

### 8. Shopeeデータ設計
- [x] `Order API` の用途を整理する
- [x] `Product API` の用途を整理する
- [x] `Returns API` の用途を整理する
- [x] `Payment / Escrow API` の用途を整理する
- [x] `売上速報` と `回収見込み` の分離を整理する
- [x] 販売モデルが `無在庫販売（Amazon在庫連動）` であることを前提として確定する
- [x] Shopeeの在庫数は実態を反映しないため、低在庫判断に使わない方針を確定する
- [x] このモデル固有の重要指標（発送期限別未発送・キャンセル費用・返品費用・推定利益）を追加する方針を確定する
- [x] 広告費（`adSpendDaily`）とアフィリエイト費用（`affiliateCost`）を経営指標として正式追加する方針を確定する
- [x] 広告費・アフィリエイト費用は `nullable` 設計とし、取得不可の場合は空欄で記録する方針を確定する
- [x] 広告費 API カテゴリ（`Ads`）がアクセス可能であることを確認する（API Test Tool で存在確認済み）
- [x] Ads カテゴリの利用可能 API 全一覧を確認する
  - `v2.ads.get_total_balance` - 広告残高
  - `v2.ads.get_shop_toggle_info` - ショップ広告オンオフ状態
  - `v2.ads.get_recommended_keyword_list` - キーワード候補
  - `v2.ads.get_recommended_item_list` - 推奨商品
  - **`v2.ads.get_all_cpc_ads_hourly_performance`** - CPC広告時間別パフォーマンス ← 広告費取得候補
  - **`v2.ads.get_all_cpc_ads_daily_performance`** - CPC広告日次パフォーマンス ← 広告費取得メイン候補
  - `(coming offline soon) v2.ads.create_auto_product_ads` - 廃止予定
  - `(coming offline soon) v2.ads.edit_auto_product_ads` - 廃止予定
  - **`v2.ads.get_product_campaign_daily_performance`** - 商品キャンペーン日次
  - `v2.ads.get_product_campaign_hourly_performance` - 商品キャンペーン時間別
  - `v2.ads.get_product_level_campaign_id_list` - キャンペーンID一覧
  - `v2.ads.get_product_level_campaign_setting_info` - キャンペーン設定情報
  - `v2.ads.create_manual_product_ads` - 手動広告作成
  - `v2.ads.edit_manual_product_ad_keywords` - キーワード編集
  - `v2.ads.edit_manual_product_ads` - 手動広告編集
  - `v2.ads.get_create_product_ad_budget_suggestion` - 予算提案
  - `v2.ads.get_product_recommended_roi_target` - ROI目標推奨
  - `v2.ads.check_create_gms_product_campaign_eligibility` - GMSキャンペーン適格性確認
  - `v2.ads.create_gms_product_campaign` - GMSキャンペーン作成
  - `v2.ads.edit_gms_product_campaign` - GMSキャンペーン編集
  - `v2.ads.list_gms_user_deleted_item` - GMS削除商品一覧
  - `v2.ads.edit_gms_item_product_campaign` - GMS商品キャンペーン編集
  - **`v2.ads.get_gms_campaign_performance`** - GMSキャンペーンパフォーマンス
  - **`v2.ads.get_gms_item_performance`** - GMS商品パフォーマンス
  - ※ アフィリエイト費用専用 API は Ads カテゴリには存在しない（別途確認要）
- [x] 主要 API の疎通確認を完了する
  - `v2.order.get_order_list` → Status 200 確認済み
  - `v2.payment.get_escrow_detail` → Status 200 確認済み（order_not_found はサンドボックスの正常挙動）
  - `Ads` カテゴリ → ドロップダウンに存在確認済み
- [x] 利用可能な API カテゴリ全一覧を確認する
  - Product / GlobalProduct / MediaSpace / Shop / Merchant / Order / Logistics / FirstMile
  - Payment / Discount / TopPicks / ShopCategory / Returns / AccountHealth / Public / Push
  - Bundle Deal / Add-On Deal / Voucher / Follow Prize / **Ads** / (SCS) Inventory / ShopFlashSale / SBS / FBS / Media
- [ ] 広告費 API（`v2.ads` 系）の実フィールドと権限要件を確認する（本番環境で実データを使って確認）
- [ ] アフィリエイト費用 API の取得可否を確認する（Ads カテゴリ内を精査）
- [ ] 返品補償ルール（スキャン完了後キャンセル・返品の半額補償・上限150ドル・数か月後支払い）の詳細設計を行う
- [ ] 日報で使う実データ項目を API 単位で確定する
- [ ] 週報で使う実データ項目を API 単位で確定する
- [ ] 月報で使う実データ項目を API 単位で確定する

### 9. SSoT / 構成整理
- [x] 現状の設計メモは `このままでは SKILL.md に長すぎる` と判定する
- [x] `SKILL.md は短く、詳細は references/ に逃がす` 方針を確認する
- [x] `決定的処理はコードに寄せる` 方針を確認する
- [x] スキルを複数に分割する前提を確認する
- [x] `報告ツールちゃん` の SKILL.md に何を書くか確定する（何をするか・いつ使うか・入出力・参照先リンクのみ）
- [x] `references/` に分ける情報の一覧を確定する（章立て・裁定ルール・口調制約・観測パック）
- [x] 各レビュー役スキルの SKILL.md / references の責務境界を確定する
- [x] 共通情報の原本を `shopee-reporting-common/` に集約する方針を確定する

スキルファイル構成（確定）:
- `shopee-report-tool/` ← 報告ツールちゃん（SKILL.md + references/chapter-structure, review-governance, tone-constraints）
- `shopee-execution-strategist/` ← 執行参謀（SKILL.md + references/output-template）
- `shopee-management-consultant/` ← 経営コンサルタント（SKILL.md + references/output-template）
- `shopee-reality-auditor/` ← 現実監査官（SKILL.md + references/output-template, life-profile-structure）
- `shopee-reporting-common/` ← 全スキル共通（data-commodity-spec, input-design, commitment-rules, reason-tags）

コード構成（DDD軽量採用・確定。アーキレビュー反映済み）:
```
apps/shopee-reporting/src/
  domain/                    ← ビジネスルール・型定義・バリデーション（外部依存なし）
    shop/                    ← Shop エンティティ・ShopRepository Interface
    snapshot/                ← DailySnapshot, MonthlySnapshot, Value Objects (Money等)
    todo/                    ← Todo エンティティ・TodoStatus・CarryoverPolicy (Domain Service)
    commitment/              ← Commitment エンティティ・CommitmentScorer (Domain Service)
    report/                  ← Report エンティティ・DailyReport/WeeklyReport/MonthlyReport 型
    profile/                 ← LifeProfile, CapacityProfile
    review/                  ← AIレビュー人格定義（プロンプト仕様）← infrastructure非依存
      execution-strategist-persona.ts
      management-consultant-persona.ts
      reality-auditor-persona.ts
  application/               ← ユースケースの調整役（Repositoryインターフェース越しに呼ぶ）
    generate-daily-report/   ← 日報生成フロー（アーキレビューで分割）
    generate-weekly-report/  ← 週報生成フロー
    generate-monthly-report/ ← 月報生成フロー
    process-checkin/         ← チェックイン結果の処理
    assemble-observation-pack/ ← 観測パックの組み立て
  infrastructure/            ← 外部サービスとの接続実装
    shopee/                  ← Shopee API fetcher（国別エンドポイント対応）
                               ← トークンリフレッシュロジック含む（4時間期限対応）
                               ← リフレッシュ後は必ずSupabaseに保存してから次APIを呼ぶ
    supabase/                ← Repository実装（全テーブルCRUD）
    slack/                   ← sendReport() / sendCheckinUrl() / sendError() を別関数で定義
    surge/                   ← IHtmlPublisher インターフェースを定義・CLI実装（モック可能）
    ai/                      ← AnthropicClient（薄ラッパー）のみ。プロンプトはdomain/review/から受け取る
  presentation/              ← エントリーポイント（node で直接実行するスクリプト）
    workflows/
      daily-report.ts        ← node dist/workflows/daily-report.js で実行
      weekly-report.ts
      monthly-report.ts
      checkin-reminder.ts
      error-notifier.ts

apps/shopee-reporting/.github/workflows/
  daily-report.yml           ← cron: '0 0 * * *' (UTC=8:00 SGT) → node コマンド
  weekly-report.yml
  monthly-report.yml
  checkin.yml                ← cron: '0 3 * * *' (UTC=11:00 SGT) → checkinURL送信
  checkin-reminder.yml       ← cron: '0 4 * * *' (UTC=12:00 SGT) → 未回答リマインド
```

### 10b. 初回セットアップフロー（UXレビュー反映・新設）
- [x] 初回セットアップの導線を明示する
  - **最小手段**: Supabase管理画面から `life_profile` / `goal_presets` テーブルに直接初期値を挿入する
  - **望ましい手段**: surge.sh に初回プロフィール入力フォームを公開する（Step9で実装）
  - 初回フォームURLはREADMEに記載し、セットアップ手順書として機能させる
  - 初回プロフィール未設定の場合: 現実監査官はスキップし「プロフィール未設定のためスキップ」と明示する
- [x] 目標・プロフィール変更フローを明示する
  - Supabase管理画面での直接編集を正式な変更手段とする（MVP段階）
  - 将来的に変更専用フォームを用意してよいが、MVP外

### 10. 実装前の最終整理
- [x] 実装対象の最小MVPを1文で言える状態にする
  - 「ダミーデータで日報HTMLを生成してsurge.shに公開し、SlackにURLを送るまでのパイプラインを自動で動かす」
- [x] 最初に作るファイル構成を確定する（apps/shopee-reporting/ 配下・上記コード構成参照）
- [x] コード側に持つ型 / DB / scheduler の最小構成を確定する
  - 型: `Shop` / `DailySnapshot` / `DailyReport` / `SlackPayload` / `Todo` / `CheckinResult` / `Commitment` / `Report`（domain層に定義）
  - TodoStatus 列挙型: `OPEN` / `DONE` / `PARTIAL` / `MISSED` / `CARRIED_OVER` / `DROPPED`
  - DB: **Supabase**（PostgreSQL）。以下テーブルからMVP開始
    - `shops`: shop_id / country / display_name / access_token / refresh_token
    - `daily_snapshots`: date / shop_id（複合ユニークキー）/ 各指標 / `is_finalized`（速報→確定値フラグ）
    - `monthly_snapshots`: year_month / shop_id（複合ユニークキー）/ 月次集計指標（3年保持・独立テーブル）
    - `todos`: todo_id（UUID）/ shop_id / date / content / priority / estimated_minutes / theme / status（TodoStatus）/ carryover_from（todo_id FK nullable）
    - `checkin_results`: checkin_id（UUID）/ todo_id（FK）/ date / status / memo / submitted_at
    - `commitments`: commitment_id（UUID）/ shop_id / period_type（weekly/monthly）/ period_key / content / metric / result_status / result_memo
    - `reports`: report_id（UUID）/ shop_id / report_type / report_date / draft_url / final_url / slack_ts
    - `life_profiles`: profile_id（UUID）/ version（整数）/ payload（JSON）/ created_at（変更履歴用・旧versionは論理削除しない）
    - `external_tool_snapshots`: date / tool_name / data_type / payload（JSON）/ created_at
  - DDDレビュー反映: `todos` / `checkin_results` / `commitments` / `reports` は独立エンティティとして設計（daily_snapshotsに混在させない）
  - Scheduler: GitHub Actions・手動実行トリガー（workflow_dispatch）必須
  - 永続化: GitHub ActionsはSQLiteを使えないためSupabaseに統一（設計変更確定）
  - 冪等性: upsert設計・URLにdate+shop_idを含める
  - **タイムゾーン方針（DDDレビュー反映）**: SG/MY/PHはすべてUTC+8。GitHub ActionsのcronはUTC基準のため、毎朝8時SGT（= 00:00 UTC）にスケジュールする。`date` フィールドは常にUTC+8換算の日付を使用する。
- [x] 実装着手順を確定する（最終レビュー反映: Phase A〜Gの安全な順序に整合）
  - **Phase A（Step1〜2）: domain層 + DBスキーマ確定**（外部依存なし・テスト可能な状態から開始）
    - Step1: プロジェクト初期設定・TypeScript / ESLint / tsconfig
    - Step2: domain層の型定義・Value Object・TodoStatus列挙型を全て先に確定
    - Step2.5: Supabaseスキーマ作成（全テーブル）・Repositoryインターフェース定義・ダミー実装
  - **Phase B（Step3〜4）: HTML生成 + surge公開**（ダミーデータで動作確認）
    - Step3: 日報HTMLテンプレート（ハードコードダミーデータ・3か国アンカーリンク付き）
    - Step4: surge.sh公開（IHtmlPublisher経由）
  - **Phase C（Step5〜6）: Slack + GitHub Actions**（エラー通知含む）
    - Step5: Slack通知（sendReport / sendCheckinUrl / sendError の3関数）
    - Step6: GitHub Actions ワークフロー接続・手動実行テスト（concurrencyグループ設定含む）
  - **Phase D（Step7）: Shopee API実接続**（ページネーション・トークンリフレッシュ含む）
    - Step7: Shopee API実接続（3か国・ページネーション対応・レートリミット500ms待機・トークンリフレッシュ）
  - **Phase E（Step8）: 週報・月報追加**
    - Step8: 週報・月報追加（時系列比較・4週/6ヶ月推移）
  - **Phase F（Step9）: チェックインフォーム追加**
    - Step9: チェックインフォーム（surge.sh HTML + Supabase REST + RLS設定）
  - **Phase G（Step10）: AIレビュー追加**
    - Step10: AIレビュー追加（執行参謀 + 経営コンサル + 現実監査官）

### 12. DDD軽量採用・追加設計（新設）
- [x] コード構成をDDD軽量層（domain / application / infrastructure / presentation）に変更する
- [x] マルチショップ・マルチカントリー設計を追加する
  - Shop エンティティ（shop_id / country / access_token）を domain/shop/ に定義する
  - 全テーブルに shop_id カラムを追加する
  - Shopee API の認証は国ごとに異なるエンドポイント・トークンを使う
  - **レポートファイル構成: 1 HTML（1 Surge URL）に統合する**
    - ファイルを3つ開く手間をなくす
    - 構成: `[3か国横断サマリー・経営方針]` → `[SG詳細]` → `[MY詳細]` → `[PH詳細]` の順に縦並び
    - 3か国横断セクションは合算指標 + 国別比較グラフ + AI横断経営方針（来月/来週の重点国選定含む）
    - URLにはdateのみ含める（例: report-daily-2026-05-13.html）
    - DBはshop_idで分離したまま、HTMLへの統合はプレゼンテーション層の責務
    - Slack通知は「今日のレポートはこちら」のURL1本のみ（国別に3本は出さない）
    - **HTMLレポート最上部にアンカーリンクを必須配置する**（UXレビュー反映）
      - 例: `[ 横断サマリー | SG | MY | PH ]` のナビゲーションバーを固定表示
      - 各国セクションの見出しにidを付与してジャンプ可能にする
- [x] Repository インターフェースを application 層に定義する
  - application 層は Repository interface のみに依存する
  - infrastructure/supabase/ が実装する（差し替え・テスト容易性を確保）
- [x] エラーハンドリング方針を確定する
  - 致命的エラー（DB書き込み失敗）: Slackに「本日のレポートを生成できませんでした: 理由」を送る
  - 継続可能エラー（nullable APIフィールドの取得失敗）: nullで記録してレポートに「データなし」表示
  - スキップ可能エラー（外部ツールデータなし）: 該当章をスキップする
  - **Shopeeトークンリフレッシュ失敗時**（運用レビュー反映）: Slackアラートを送り、その日のレポートはツール内導出データのみで生成して継続する
  - **Anthropic API失敗時**（運用レビュー反映）: 1回リトライ後失敗→AIコメントなしでレポート生成継続（AI部分は「取得不可」と表示）
  - **surge.sh deploy失敗時**（運用レビュー反映）: 1回リトライ後失敗→Slackアラートを送り、HTML URL抜きのSlack要約のみ送信
  - GitHub Actionsのretry設定: 自動リトライ最大3回
- [x] 冪等性（Idempotency）設計を確定する
  - daily_snapshots は `date + shop_id` を複合ユニークキーにする
  - 書き込みは常にupsert（重複実行しても同じ結果になる）
  - レポートHTMLのURLに date と shop_id を含める（例: report-MY-2026-05-13.html）
  - 同じ日に複数回実行しても安全
  - **Slack重複送信防止**（運用レビュー反映）: 送信前に `reports` テーブルの当日の `slack_ts IS NOT NULL` を確認し、存在すれば送信しない
  - **todos重複防止**（運用レビュー反映）: 同日・同shop_idのTODOが既存の場合は生成スキップ
- [x] 運用セキュリティ方針を確定する（運用レビュー反映・新設）
  - **GitHub Secretsに格納するキー一覧**: SHOPEE_PARTNER_ID / SHOPEE_PARTNER_KEY / SHOPEE_ACCESS_TOKEN_SG / SHOPEE_ACCESS_TOKEN_MY / SHOPEE_ACCESS_TOKEN_PH / SHOPEE_REFRESH_TOKEN_SG / SHOPEE_REFRESH_TOKEN_MY / SHOPEE_REFRESH_TOKEN_PH / SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / ANTHROPIC_API_KEY / SURGE_TOKEN / SLACK_WEBHOOK_URL
  - **surge.sh HTMLに含めてよいキー**: SUPABASE_URL / SUPABASE_ANON_KEY のみ（RLS設定必須）
  - **surge.sh HTMLに絶対に含めてはいけないキー**: SUPABASE_SERVICE_ROLE_KEY
  - **Supabase RLS設計**: `checkin_results` テーブルはanon roleでINSERT onlyに制限。SELECT/UPDATE/DELETEはService Role Keyのみ許可。
  - **surge.sh公開レポートのアクセス制御方針**: URLの秘匿性に依存する（意図した仕様・個人ツール）。将来的にsurge.sh basic認証（surge CLIの `--auth` オプション）で保護する選択肢を残す。
  - **ログへの機密情報出力禁止**: APIレスポンスのフルダンプをログに出さない（トークン・金額含む）
- [x] Shopee API運用方針を確定する（運用レビュー反映・新設）
  - **ページネーション対応**: `get_order_list` 等のリスト系APIはページネーション必須。`more = true` の間ループで全件取得する。取得件数上限は1API呼び出しあたり100件/ページ（Shopee仕様）。
  - **レートリミット対応**: 各APIカテゴリ呼び出し間に最低500msの待機を入れる。429レスポンス時は指数バックオフ（1s→2s→4s）でリトライ。
  - **トークンリフレッシュ**: 毎回実行前にアクセストークンの有効期限を確認し、3時間以内に失効する場合はrefresh_tokenで更新してSupabaseに保存してから実行する。
- [x] GitHub Actions concurrency設定を追加する（運用レビュー反映）
  - 全ワークフローに `concurrency: group: ${{ github.workflow }}-${{ github.ref }}` を設定し、同一ワークフローの同時実行をキャンセルする
- [x] Anthropic API呼び出し回数上限ガードを追加する（運用レビュー反映）
  - 1実行あたりのAnthropic API呼び出し回数の上限を10回とし、超えた場合は実装エラーとして処理を停止する（コスト急増防止）
- [x] AI呼び出し方針を確定する
  - GitHub Actions から Anthropic API を直接呼び出す
  - API Key は GitHub Secrets に保管
  - infrastructure/ai/ に薄いラッパーを置く（モデル変更・差し替えを容易にするため）
  - **プロンプト定義は `domain/review/` に置く**（アーキレビュー反映: infrastructure層にビジネスロジックを漏らさないため）
  - infrastructure/ai/ はAnthropicAPIクライアントのみ。プロンプト文字列はdomain/review/から受け取る
  - AIの出力は JSON 形式で返させてパースする（自由テキストは受け取らない）
  - AIレビューは MVP には含めない（Step10 で追加）

### 11. 外部ツール連携設計（新設）
- [x] 競合分析ツール等の将来接続を想定した受け口を設計する
- [x] データコモディティに第3面 `外部ツール由来データ面` を追加する
- [x] 外部ツールの接続仕様を確定する（`external_tool_snapshots` テーブルに書き込むだけ）
  - カラム: `date`, `tool_name`, `data_type`, `payload（JSON）`, `created_at`
- [x] 報告ツールの挙動を確定する（データがあれば使う・なければスキップ・エラーにしない）
- [x] 週報・月報に `競合・市場動向` 章を追加し、外部ツールデータがある場合のみ表示する
- [x] 経営コンサルタントの入力に `competitorData（nullable）` を追加する
- [ ] 競合分析ツール本体の設計・開発（別途検討）

## 最初のスコープ
最初から日報・週報・月報・チャット通知・高度な経営コンサル提案を全部同時に入れると重いので、まずはMVPを切ります。

今回のツールは、単なる数字一覧ではなく、**状況把握と意思決定支援のレポートツール**として設計します。各レポートで、少なくとも次の5点が返る状態を目標にします。

- 何が起きたか
- 何に注意すべきか
- なぜそうなっていそうか
- 今日 / 今週 / 今月に何をやるべきか
- その優先順位と理由

ただし、初回の出力はあくまで `無機質なたたき台` に留めます。  
最終判断に近い文章は、別人格のレビュー役で順番に磨いてから確定します。

MVPの範囲:
- Shopee APIで取得できる売上・注文・精算系データを整理する
- ダミーデータで日報HTMLを先に作る
- 日報で `状況要約 + 注意点 + TODO案 + 時間配分` を出す
- 12時に `昨日の日報TODO + 未完了の持ち越しTODO` の実施報告を回収する（今日のTODOはまだ未実施のため昨日分を報告）
- 12時チェックインと同時に、週次・月次の実行余力プロファイルも回収する
- 週次・月次では、目標に対する `達成度報告` を必須で回収する
- TODOレビュー役スキルが、TODOの妥当性・実行可能性・偏りをレビューする
- 経営コンサルタントスキルが、方針と盲点をレビューする
- レビューを受けて最終版を整え、Slackに報告する
- 手動実行でレポートを生成する
- 週報・月報へ広げるための共通データモデルを作る

MVPの外に一旦置くもの:
- チャット通知の自動化
- 返信案生成
- 複数通知先対応
- 高度な経営コンサル提案の自動化

## 日報の章立て（確定）

HTMLファイルは1枚。構成: [3か国横断セクション] → [SG] → [MY] → [PH]

```
━━━━━━━━━━━━━━━━━━━━━━━
【3か国横断サマリー】
━━━━━━━━━━━━━━━━━━━━━━━
0. 3か国横断状況判断  ← 核
   - 当日合計速報（SG + MY + PH の合算: 注文数 / 粗収入）
   - 3か国横断アラート（最優先対応が必要な国・案件）
   - 3か国横断経営方針（執行参謀 + 経営コンサル）
     「今日は〇〇国の〜に最優先対処、なぜなら〜。〇〇国は現状維持で可。」

━━━━━━━━━━━━━━━━━━━━━━━
【SG / MY / PH 各国詳細（以下繰り返し）】
━━━━━━━━━━━━━━━━━━━━━━━
1. 当日速報（情報層・コンパクト）
   - 売上速報（注文数 / 粗収入 / 前日比）
   - 回収見込み（エスクロー状況）
   - 広告費日次（nullable）

2. 運営アラート（情報層・コンパクト）
   - 発送期限別未発送件数（高リスク優先）
   - キャンセル / 返品 件数・推定費用
   - 上位SKU / 下降SKU

3. 状況判断サマリー  ← 核
   - 報告ツールちゃん: 今日の状況を一言で
   - 執行参謀: 「この状況では〜が最優先、なぜなら〜」
   - 経営コンサル: 方針面の補足（日報では短く）

4. 今日のTODO  ← 厚くする
   各TODOに必須: 内容 / 判断根拠 / 優先順位と理由 / 推定所要時間 / 重点テーマ紐づけ

5. 今週の方針（継続確認）  ← 厚くする
   - 現在の重点テーマ
   - 「今週はこれに注力する、なぜなら〜」
   - 前回方針からの変更点と理由

6. 昨日のTODO振り返り
   - 完了 / 一部完了 / 未完了 の集計（チェックイン結果）
   - 持ち越しTODO一覧と引き継ぎ理由
```

## 週報の章立て（確定）

HTMLファイルは1枚。構成: [3か国横断セクション] → [SG] → [MY] → [PH]

```
━━━━━━━━━━━━━━━━━━━━━━━
【3か国横断サマリー】
━━━━━━━━━━━━━━━━━━━━━━━
0. 3か国横断状況判断  ← 核
   - 週計合算速報（SG + MY + PH: 売上 / 注文数 / 広告費合計）
   - 3か国横断時系列比較（直近4週間の国別売上推移グラフ）
   - 国別パフォーマンス比較（今週の各国の強弱・注目ポイント）
   - 3か国横断経営方針（執行参謀 + 経営コンサル）
     「今週は〇〇国が〜の理由で重点対応。〇〇国は〜のトレンドに乗れるか要観察。」
   - 来週の国間リソース配分示唆（どの国に手を入れるべきか）

X. 競合・市場動向（外部ツールデータがある場合のみ・横断セクション内）
   - 競合価格帯の変化 / カテゴリトレンド / 自社ポジション変化
   - 経営コンサルによる考察

━━━━━━━━━━━━━━━━━━━━━━━
【SG / MY / PH 各国詳細（以下繰り返し）】
━━━━━━━━━━━━━━━━━━━━━━━
1. 週次速報（情報層・コンパクト）
   - 週計売上 / 注文数 / 前週比
   - 回収見込み / 週計広告費 / アフィリエイト費用（nullable）
   - キャンセル / 返品 週計・費用

2. 時系列比較  ← 核
   - 同週比較: 今週 vs 前月同週 vs 前々月同週
   - 直近4週間推移: 売上 / 注文数 / 広告費 / キャンセル率
   - トレンドの自動考察

3. 商品動向（週次）
   - SKU週次ランキング（上昇 / 下降 / 新規）
   - 直近4週での売れ筋変化

4. 週次状況判断サマリー  ← 核
   - 報告ツールちゃん: 今週の状況を一言で
   - 執行参謀: TODO達成度評価と来週への示唆
   - 経営コンサル: 比較考察を踏まえた方針評価・修正提案
   - 現実監査官: 生活目標との乖離・長期リスク警告

5. 来週のTODO  ← 厚くする
   各TODOに必須: 内容 / 判断根拠（比較含む）/ 優先順位理由 / 推定時間 / テーマ紐づけ

6. 来週の方針  ← 厚くする
   - 重点テーマ（維持 / 変更）と変更理由
   - 週次コミットメント（来週の約束）の設定

7. 今週の振り返り
   - TODO達成率集計 / 週次コミットメント達成度と未達理由
   - 持ち越しTODO一覧と引き継ぎ理由

8. 来週の実行余力プロファイル
   - 稼働可能時間 / 制約 / 余力に基づくTODO量調整コメント
```

## 月報の章立て（確定）

HTMLファイルは1枚。構成: [3か国横断セクション] → [SG] → [MY] → [PH]

```
━━━━━━━━━━━━━━━━━━━━━━━
【3か国横断サマリー】
━━━━━━━━━━━━━━━━━━━━━━━
0. 3か国横断状況判断  ← 核
   - 月計合算速報（SG + MY + PH: 売上 / 注文数 / 広告費 / 実質利益合計）
   - 3か国横断時系列比較（直近6ヶ月の国別売上推移グラフ）
   - 国別パフォーマンス比較（今月の各国の強弱・貢献度）
   - 3か国横断経営方針（執行参謀 + 経営コンサル + 現実監査官）
     「今月は〇〇国が全体を牽引。〇〇国は広告効率が悪化中で来月是正必要。」
     「3か国全体で見ると目標進捗は〇〇%、このペースだとあと〇ヶ月で目標達成 / 未達」
   - 来月の国間リソース配分・重点国の選定と理由

X. 競合・市場動向（外部ツールデータがある場合のみ・横断セクション内）
   - 競合価格帯の変化 / カテゴリトレンド / 自社ポジション変化
   - 経営コンサルによる考察

━━━━━━━━━━━━━━━━━━━━━━━
【SG / MY / PH 各国詳細（以下繰り返し）】
━━━━━━━━━━━━━━━━━━━━━━━
1. 月次速報（情報層・コンパクト）
   - 月計売上 / 注文数 / 前月比
   - 回収見込み / 月計広告費 / アフィリエイト費用 / 実質利益（nullable）
   - キャンセル / 返品 月計・費用 / 返品補償保留額

2. 時系列比較  ← 核
   - 同月比較: 今月 vs 前年同月 vs 前々年同月
   - 直近6ヶ月推移: 売上 / 注文数 / 広告費 / キャンセル率 / 実質利益
   - トレンドの自動考察

3. 商品動向（月次）
   - SKU月次貢献度ランキング
   - 直近6ヶ月での売れ筋変化

4. 月次状況判断サマリー  ← 核
   - 報告ツールちゃん: 今月の状況を一言で
   - 執行参謀: TODO達成度評価と来月への示唆
   - 経営コンサル: 比較考察を踏まえた戦略評価・代替案提案
   - 現実監査官: 「このペースだとあと〇ヶ月で目標に届く/届かない」長期シミュレーション

5. 来月のTODO  ← 厚くする
   各TODOに必須: 内容 / 判断根拠 / 優先順位理由 / 推定時間・週配分 / テーマ紐づけ

6. 来月の方針  ← 厚くする
   - 重点テーマ（維持 / 変更）と変更理由
   - 月次コミットメント（来月の約束）の設定

7. 今月の振り返り
   - TODO達成率集計 / 月次コミットメント達成度と未達理由 / 持ち越しTODO

8. 来月の実行余力プロファイル
   - 稼働可能時間 / 制約 / 余力に基づくTODO量調整コメント
```

## 人間側入力設計（確定）

### 初回プロフィール（現実監査官・経営コンサル用）

```
── 生活・財務基盤 ──
・現在の手取り（月、円）
・目標手取り（月、円）+ 達成期限
・現在の貯蓄・資産（円）
・資産目標（円）+ 達成期限
・月の生活固定費（円）
・月のビジネス固定費（円）
・ビジネス成長に使える運転資金の上限（円）
・「これで成功した」と感じる状態を一文で

── 時間・エネルギー ──
・現在の週あたり作業時間（時間）
・目標の週あたり作業時間（自動化後に目指す上限）
・絶対に作業できない曜日・時間帯
・好きな仕事のやり方（集中ブロック型 / 短時間分散型）

── ビジネスビジョン ──
・12ヶ月後にこのビジネスをどういう状態にしたいか（一文）
・中期的な方向性（ドロップシッピング継続 / ブランド化 / 在庫保有移行 / 多角化 / 未定）
・好きな業務・嫌いな業務（自由記述）
・絶対にやらないこと（カテゴリ・手法・行動）

── リスク・制約 ──
・広告費の月次上限（円）
・リスク姿勢（安定重視 / バランス / 成長優先）
・最も心配している将来リスク（自由記述）
・教育費の見込み（なし / あり→金額・時期）
```

プロフィール最終更新から3ヶ月経過で月報に更新促進を表示する。変更なしの場合は1タップで更新日だけ更新できる。

### 週次入力（毎週月曜 チェックイン時）

```
── Shopee/Amazon状況（数字に映らない変化・Tier B）──
・主力SKUのAmazon価格に大きな変動があったか
・Amazonの在庫切れ・入荷遅れで影響を受けたか
・競合の動きで気になったことはあるか
・Shopeeの仕様変更・アルゴリズム変化を感じたか
・カスタマーからのクレーム・フィードバックで傾向はあったか

── 個人状態（Tier A / B）──
・今週使える作業時間（時間）← Tier A
・コンディション・集中度（1〜5）← Tier A
・エネルギーを奪っているものは何か ← Tier C

── 正直な振り返り（Tier C）──
・ずっと後回しにしていることは何か
・先週立てた前提で外れたものは何か
・今週1つだけやるとしたら何か
```

### 月次入力（月初 チェックイン時）

```
── ビジネスの健康チェック ──
・うまくいっていないのに放置していることは
・予想以上にうまくいっていることは
・来月最も心配していることは
・今のビジネスのトレンド感覚（上向き / 横ばい / 下降）
・今月の目標達成への自信（1〜10）+ なぜ満点でないか

── 戦略レビュー ──
・参入・撤退したい商品カテゴリはあるか
・試していないが気になっているアイデアは
・競合でまねたいと思った動きはあるか

── 3ヶ月後の具体目標 ──
・売上目標（円）/ 実質利益目標（円）/ 運営改善目標1つ

── 作業量の調整 ──
・今月使える作業時間の合計（時間）
・今月の全体余裕度（余裕あり / 普通 / タイト / かなりきつい）
```

### 臨時入力（突発イベント用）

いつでも投稿できる臨時報告フォームを `external_tool_snapshots` テーブルの `tool_name: "manual_event"` として記録する。次回レポートの考察材料として使う。

## 未入力対応方針（確定）

| 層 | 対象例 | 未回答時の挙動 |
|---|---|---|
| Tier A（補完不可） | 作業時間・コンディション | 前回値使用・レポートに明記・3週連続で確認ボタン |
| Tier B（前回値で推定） | Amazon変化・競合変化 | サイレント補完（変化なしとみなす）|
| Tier C（あれば深まる） | 後回し・振り返り質問 | スキップ・3回連続で非表示→月初に再表示 |

- 未入力が多い週は分析の厚みが自然と薄くなる（ペナルティではなく品質の自然変化）
- 「情報が足りないから判断できない」とは言わない。利用可能な情報で判断し制約を明示する

## 達成度報告設計（確定）

### 週次コミットメント

- 設定: 週報の「来週の方針」章で1〜3件・結果ベース・測定方法付き（上限3件を執行参謀が強制）
- 報告: 達成 / 一部達成 / 未達成 + 理由カテゴリ + 一言
- 理由カテゴリ: `外部要因` / `時間不足` / `優先変更` / `先延ばし` / `目標高すぎ` / `情報不足`
- 3回連続同一理由で執行参謀が構造的問題として指摘する

### 月次コミットメント

- 設定: 月報の「来月の方針」章で2〜4件・数値目標必須・週配分付き（上限4件を経営コンサルが強制）
- 報告: 達成 / 一部達成（何%か）/ 未達成 + 理由カテゴリ + 自由記述
- 月内の週次推移も自動表示（データコモディティから集計）

### 共通ルール

- 前回の約束と結果はレポート冒頭近くに必ず表示する
- 未回答の約束は目立つ形で表示する（スルーさせない）
- 同じ理由カテゴリが3回連続した場合: 「先延ばし」→コミットメント自体の見直し提案 / 「時間不足」→余力プロファイルの過大評価を指摘

## 4つのパーツの初期案
```mermaid
flowchart LR
trigger[Trigger]
source[Source]
process[Process]
delivery[Delivery]

trigger -->|"毎日 / 毎週 / 毎月の定期実行"| source
source -->|"Shopee API / 必要に応じてタスク台帳"| process
process -->|"集計・異常検知・TODO提案・方針整理"| todoReview[TodoReviewerSkill]
todoReview -->|"TODOレビュー反映"| checkin[TodoCheckin]
checkin -->|"実施報告 + 実行余力反映"| strategyReview[ConsultantSkillReview]
strategyReview -->|"レビュー反映"| delivery
delivery -->|"Slack通知"| endNode[運用]
```

初期案:
- トリガー: 朝に前日 / 前週 / 前月を振り返る定期実行
- ソース元: Shopee Open Platform の Order / Product / Payment 系を中心に使用し、必要なら `選択式の目標/方針入力` を補助利用
- 処理する場所: Node.js/TypeScript のバッチ
- 中間報告: 12時のTODO実施チェックイン
- 追加入力: 週次・月次の `実行余力プロファイル`
- レビュー: `TODOレビュー役スキル`、`経営コンサルタントスキル`、`現実監査官スキル`
- 届ける先: Slack（最終版のみ）

## 実装フェーズ
### Phase 1: 前提確認
- Shopee Open Platform で日報・週報・月報に必要なデータがどこまで取れるか確認する
- 注文ベースの速報値と Payment / Escrow ベースの確定寄り数値を分けて整理する
- どの数値を `日報` `週報` `月報` で使うか切り分ける
- Slack通知は `Incoming Webhook` で送るだけで十分（Interactivity不要）
- 12時チェックインは `surge.sh にHTMLフォームを公開 → SlackにURLを送る` 方式に確定
- チェックインフォームの送信先は `Supabase REST API`（JavaScriptから直接POST）
- データの永続化は `Supabase（PostgreSQL）` に統一する（SQLiteはGitHub Actionsで永続化できないため）

公式の確認先:
- [Shopee Open Platform](https://open.test-stable.shopee.com/)
- [GitHub Actions scheduled workflows](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows)
- [Slack incoming webhooks](https://api.slack.com/messaging/webhooks)
- [Slack Interactivity overview](https://api.slack.com/interactivity)
- [Slack Modals](https://api.slack.com/surfaces/modals/using)
- [Slack chat.postMessage](https://docs.slack.dev/reference/methods/chat.postMessage)

### Phase 2: 完成形HTMLを先に作る
- 課題の流れに沿って、先に「理想の日報の見た目」をHTMLで作る
- Tailwind CSSベースで、固定ダミーデータ入りの報告画面を作る
- ここでKPI、注意喚起、TODO欄、時間配分欄、方針欄の見出しを確定する
- 詳細HTMLの見せ方は `creating-visual-explainers` スキルの品質基準を参照する
- ただし運用時のHTML生成そのものは、スキル呼び出しではなくコード側テンプレートで行う

### Phase 2.5: レビュー前提の出力分離
- 報告ツール本体は `事実` `ルールベース判定` `初期TODO案` までを出す
- TODOレビュー役スキルは `TODOの粒度` `順番` `重さ` `偏り` `実行可能性` をレビューする
- 経営コンサルタントスキルは `抜け漏れ指摘` `方針レビュー` `優先順位の再評価` `代替案提示` を担当する
- 現実監査官スキルは `習慣のズレ` `長期目標からの逸脱` `生活への現実的影響` を担当する
- Slackに送るのは、レビュー反映後の最終版とする

### Phase 2.6: 選択式の目標入力
- 初期版では、自由記述の入力は最小化する
- 目標や方針は `選択式` で切り替えられるようにする
- 例: `売上成長重視` `利益率改善重視` `在庫圧縮重視` `運営安定重視`
- この選択値を、TODO生成と経営コンサルレビューの補助条件として使う

初期推奨は `用途別プリセット` とし、毎回悩まなくてよい形にする。

### Phase 2.7: TODO実施報告の設計
- TODO実施報告は `選択式 + 短い一言メモ` を基本にする
- 夜ではなく `お昼12時` にチェックインを送る
- 対象は `昨日の日報TODO + 未完了の持ち越しTODO`（今日のTODOはまだ未実施のため昨日分を報告）
- これを次回の日報・週報・月報の判断材料に反映する
- Slack上では、`status選択` と `メモ入力` を分けて扱う
- チェックインはsurge.sh HTMLフォームで完結。Slack Interactivityは使用しない

### Phase 2.8: 実行余力プロファイルの設計
- 体制・確保可能時間・実行余力の情報がないと、TODOレビュー役と経営コンサルタントスキルが理想論に寄りやすいため、別入力として管理する
- 入力タイミングは `12時のTODO実施報告` と同時に回収する
- 基本運用は `週1回の簡易確認 + 月1回の少し深い確認`
- 入力方式は `選択式 + おおまかな数値`

週次で回収したい項目の例:
- 今週確保できそうな作業時間（例: `1-3h`, `3-5h`, `5-8h`, `8h+`）
- 実務の忙しさ（例: `かなり忙しい`, `忙しい`, `普通`, `余裕あり`）
- 体制人数（例: `1人`, `2人`, `3人以上`）
- 今週の主な制約（例: `発送対応多い`, `在庫対応多い`, `私用で時間少ない`, `特になし`）

月次で回収したい項目の例:
- 来月の確保可能時間帯
- 追加で使える人手の有無
- 今月より強めにやるべきテーマ
- 今月は捨てるべきテーマ

### Phase 2.85: 現実監査官スキルの初期プロフィール設計
- 現実監査官スキルには、`初回だけ詳細数値をまとめて設定し、その後はめったに変えない` 前提のプロフィールを持たせる
- 入力方式は `できるだけ具体的な数値`
- 更新方式は `initial_then_rare` とし、普段は変更せず、人生設計や家計設計が変わったときだけ見直す

初回に設定する項目の例:
- 月の最低生活費
- 月の理想手取り
- 月の最低許容手取り
- 現在の金融資産額
- 目標資産額
- 目標資産の達成希望時期
- 月の最低確保したい自由時間
- 月の理想自由時間
- 子どもの教育費など、大きな将来支出イベント
- その支出の必要時期
- 絶対に避けたい状態の定義

絶対に避けたい状態の例:
- 生活費を安定して賄えない
- 教育費積立が開始できない
- 自由時間が継続的に失われる
- 目標資産形成の開始が大きく遅れる

初回プロフィール入力仕様の推奨:

数値入力にする項目:
- 月の最低生活費
- 月の理想手取り
- 月の最低許容手取り
- 現在の金融資産額
- 目標資産額
- 目標資産の達成希望年月
- 月の最低自由時間（時間）
- 月の理想自由時間（時間）
- 子どもの教育費など大きな将来支出の金額
- その支出が必要になる予定年月

選択式にする項目:
- 家族フェーズ（例: `独身`, `夫婦`, `子育て中`, `教育費期が近い`）
- 収入の安定度（例: `かなり不安定`, `やや不安定`, `普通`, `比較的安定`）
- 生活防衛の優先度（例: `最優先`, `高い`, `普通`）
- 自由時間の重要度（例: `最優先`, `高い`, `普通`, `低い`）
- 避けたい状態タグ（複数選択）
- 長期目標の重みづけ（例: `収入重視`, `資産形成重視`, `自由時間重視`, `家族支出重視`, `バランス重視`）

なるべく数値入力にしない項目:
- 感情
- 抽象的な不安
- 毎回変わる気分

入力負荷を下げる工夫:
- 将来支出イベントは `最大3件まで`
- 避けたい状態タグは複数選択式
- 年月入力は `YYYY-MM` のみ
- 金額は `月額` または `総額` のどちらかに統一する

### Phase 2.9: 達成度報告と約束の設計
- 毎日の進捗確認は軽く保ち、`週1回 / 月1回` では明確な達成度報告を求める
- `罰` ではなく `約束 -> 結果報告 -> 理由説明 -> 次回修正` を強制する
- 週次・月次では、成果指標だけでなく `自分でコントロール可能な約束` も持たせる

週次で回収したい項目の例:
- 先週の主目標の達成度 (`達成` / `惜しい` / `未達`)
- 数値目標の実績値
- 自分でコントロール可能な約束の達成率
- 未達の主因 (`時間不足`, `優先順位ミス`, `想定外対応`, `難易度見積りミス`)
- 来週の主目標

月次で回収したい項目の例:
- 今月の重点テーマの達成度
- 月次の成果指標の達成率
- 今月守れたこと / 守れなかったこと
- 来月も続けること
- 来月はやめること

### Phase 2.95: TODOの持ち越し判定ルール（最終レビュー反映・新設）
- [x] TODOの持ち越しルール（CarryoverPolicy）を確定する
  - **MISSED → 翌日CARRIED_OVER**: チェックインで `MISSED` のTODOは翌日の日報に `CARRIED_OVER` ステータスで自動生成する
  - **PARTIAL → 翌日CARRIED_OVER**: `PARTIAL` のTODOも翌日に `CARRIED_OVER` として引き継ぐ
  - **DONE → 持ち越しなし**: チェックインで `DONE` のTODOは翌日に引き継がない
  - **3日連続持ち越し → DROPPED**: 同一TODOが3日連続で `CARRIED_OVER` になった場合、`DROPPED` に遷移し、週報の振り返り章に「3日持ち越しで中止」として表示する
  - **DROPPED後の再出現**: `DROPPED` になったTODOは自動再生成しない。必要なら次回のAI生成サイクルで改めて提案される
- [x] 週次集計の曜日境界を確定する（最終レビュー反映）
  - 週次レポートの「今週」は **月曜〜日曜（UTC+8基準）** とする
  - `daily_snapshots` からの週次集計は、月曜の日付から日曜の日付でフィルタして集計する
  - Shopeeダッシュボードの週区切りと一致するかは本番接続時に確認する（不一致の場合は合わせる）

### Phase 3: データモデルを固定する
- `dailyReport`
- `weeklyReport`
- `monthlyReport`
- `recommendedTodo`
- `strategyRecommendation`

のように型を定義し、AIに自由生成させる前に、必要項目をコード側で固定します。

この時点で、各レポートに共通で次の出力枠を持たせます。
- `summary`: 何が起きたか
- `alerts`: 注意点
- `whyItMatters`: なぜ重要か
- `recommendedTodos`: 推奨TODO
- `timeBudget`: 時間配分
- `strategyNotes`: 方針メモ
- `reviewComments`: 経営コンサルタントレビュー結果
- `revisedStrategyNotes`: レビュー反映後の方針メモ
- `todoReviewComments`: TODOレビュー結果
- `revisedTodos`: TODOレビュー反映後のTODO一覧
- `realityAuditComments`: 現実監査官レビュー結果
- `realityRiskSummary`: 現状行動が将来へ与える現実リスク要約
- `todoCheckinStatus`: TODO実施報告の集約結果
- `carryoverTodos`: 未完了の持ち越しTODO
- `blockedReasons`: 実施できなかった理由
- `capacityProfileWeekly`: 週次の実行余力プロファイル
- `capacityProfileMonthly`: 月次の実行余力プロファイル
- `weeklyCommitment`: 週次の約束と達成度
- `monthlyCommitment`: 月次の約束と達成度
- `missReasons`: 未達理由の分類

TODO実施報告の最小データ構造:
- `reportDate`
- `todoId`
- `slackUserId`
- `status` (`done` / `in_progress` / `not_started` / `blocked`)
- `memo`
- `channelId`
- `messageTs`

実行余力プロファイルの最小データ構造:
- `profileDate`
- `slackUserId`
- `cadence` (`weekly` / `monthly`)
- `availableHoursBand`
- `busynessLevel`
- `teamCapacityBand`
- `activeConstraintTags`

達成度報告の最小データ構造:
- `commitmentDate`
- `cadence` (`weekly` / `monthly`)
- `primaryGoal`
- `goalTargetValue`
- `goalActualValue`
- `goalResultBand` (`achieved` / `close` / `missed`)
- `controllableCommitment`
- `controllableResultBand`
- `missReasonTags`

### Phase 4: 手動実行MVPを作る
想定フォルダ:
- `[apps/shopee-reporting-assistant/src/collectors/shopee/](C:/Users/party/src/personal-visual-explainers/apps/shopee-reporting-assistant/src/collectors/shopee/)`
- `[apps/shopee-reporting-assistant/src/reports/](C:/Users/party/src/personal-visual-explainers/apps/shopee-reporting-assistant/src/reports/)`
- `[apps/shopee-reporting-assistant/src/delivery/slack/](C:/Users/party/src/personal-visual-explainers/apps/shopee-reporting-assistant/src/delivery/slack/)`
- `[apps/shopee-reporting-assistant/src/analysis/](C:/Users/party/src/personal-visual-explainers/apps/shopee-reporting-assistant/src/analysis/)`
- `[apps/shopee-reporting-assistant/config/](C:/Users/party/src/personal-visual-explainers/apps/shopee-reporting-assistant/config/)`

実装順:
1. Shopeeから注文・商品・精算系データを取る層
2. レポート用に正規化する層
3. TODOと方針提案を組み立てる層
4. TODOレビュー役スキルへレビュー依頼する層
5. Slack App で12時のTODO実施報告と実行余力プロファイルを回収・保存する層
6. 経営コンサルタントスキルへレビュー依頼する層
7. 現実監査官スキルへ週次・月次レビュー依頼する層
8. Slack送信層
9. `manual run` コマンド

### Phase 4.5: TODOと優先順位ルールを追加する
最初の版では、AIに丸投げせず、ルールベースを先に入れます。

例:
- 未発送が閾値超えなら当日の最優先TODOに入れる
- 低在庫SKUがあれば在庫確認を優先TODOに入れる
- 売上急減なら商品ページ・価格・露出の確認を週次TODOに入れる
- 返品率やキャンセル率の悪化は月次の構造課題に寄せる
- TODOは `緊急度` と `影響度` で並べる

### Phase 4.55: TODOレビュー役スキルの設計
TODOレビュー役は、`経営コンサルタント` ではなく `データドリブン執行参謀` として設計する。

推奨するプロフェッショナル像:
- `COO` 的に実行責任を持つ
- `Chief of Staff` 的に優先順位を整える
- `業務改善責任者` 的に詰まりを見抜く
- `ターンアラウンド/再建担当` 的に甘いTODOを許さない

この役が見る観点:
- このTODOは本当に事実データに根拠があるか
- TODOの粒度は大きすぎないか / 小さすぎないか
- その日・その週で本当に回る量か
- 順番は正しいか
- 持ち越しが続く構造原因を見落としていないか
- 同じ思考癖でTODOが固定化していないか
- より効率のよい代替TODOがないか

この役に求める性格:
- 冷静
- 実行重視
- 非情なくらい論理的
- 事実と推定を混ぜない
- 「忙しそう」ではなく「効くかどうか」で判断する

推奨する出力形式:
- `ハイブリッド型`
- 監査結果と、修正後の完成TODOの両方を返す

`執行参謀` の正式入力セット:
- `TODO/時間配分/持ち越しTODO/実行余力/関連する事実指標` だけを渡す
- 報告草案全文は渡さない
- `関連する事実指標` は `TODOごとに必要最小限の根拠` だけを付与する
- `経営コンサルタント` のレビュー結果は見せない

入力項目の正式内訳:
- `currentTodos`
- `timeBudgetDraft`
- `carryoverTodos`
- `capacityProfile`
- `todoEvidenceTags`
  - 各TODOに紐づく最小根拠
  - 例: `unshipped_backlog_high`, `low_stock_detected`, `sales_drop_detected`, `return_rate_worsening`

`執行参謀` の正式出力テンプレート:
1. `keptTodos`
2. `modifiedTodos`
3. `rejectedTodos`
4. `addedTodos`
5. `reorderReasons`
6. `finalTodoList`

各TODO項目で必須にする要素:
- `reasonTag`
- `reasonText`

理由タグの例:
- `over_capacity`
- `too_vague`
- `low_impact`
- `missing_evidence`
- `wrong_order`
- `carryover_pattern_detected`
- `better_split_available`

推奨する厳しさ:
- `かなり厳しく`
- 効かないTODO、重すぎるTODO、根拠の薄いTODOは積極的に切る
- ただし、切るだけで終わらず、必ず代替案か分解案を返す

### Phase 4.6: TODO実施報告の反映ルール
- 実施報告の入力形式は `完了 / 着手中 / 未着手 / 保留` を基本とする
- 各TODOに `短い一言メモ` を付けられるようにする
- `未着手` や `保留` のTODOは、理由を次回レポートの判断材料にする
- 未完了TODOは `持ち越しTODO` として翌日の候補に残す
- 持ち越しが続くTODOは、優先順位か粒度に問題がある可能性としてレビュー対象にする

チェックイン実装方針（確定）:
- 12時に GitHub Actions が昨日のTODO一覧を含むHTMLフォームを生成
- surge.sh に公開し、SlackにURLを `chat.postMessage` で送る
- ユーザーはURLを開いてステータス選択 + メモ入力 → 送信
- フォームのJavaScriptがSupabase REST APIに直接POSTして保存
- 常時起動サーバー不要・Slack Interactivity不要

### Phase 4.65: 実行余力プロファイルの反映ルール
- TODOレビュー役は、`確保可能時間` と `忙しさ` を見て、その日・その週に回らないTODOを削るか分解する
- 経営コンサルタントスキルは、`体制` と `継続可能時間` を見て、方針が現実離れしていないかを点検する
- `余力不足` が続く場合は、TODO追加ではなく `削減` `先送り` `集中テーマの絞り込み` を優先する
- 月次では、今月の実績だけでなく `来月の使える時間・人手` も踏まえて方針を決める

### Phase 4.7: 達成度報告の反映ルール
- 週次・月次では、必ず `主目標` を1つ置き、達成度を明示する
- 主目標は `少し背伸びするが現実的` な水準にする
- 成果指標だけでなく、`自分でコントロール可能な約束` も並べて評価する
- `未達` の場合は、原因を `能力不足` ではなく `時間不足 / 粒度ミス / 優先順位ミス / 外乱` に分解する
- 未達が続く場合は、努力不足と断定せず、TODO量・方針・体制のどこを縮めるべきかをレビュー対象にする
- 回答がない場合は `未回答` を明示し、次の週次・月次レビューで必ず再確認する
- 強い拘束感を作る手段として、週次・月次レポートには `前回の約束に対する結果` を必ず最上段に表示する

### Phase 4.75: 現実監査官スキルの反映ルール
- 現実監査官スキルは `毎日` は出さず、`週1回` と `月1回` のみ出現する
- 役割は `理論的な警告役` とし、`現在の習慣・行動が将来の生活と長期目標にどう悪影響するかをリアルに示すこと`
- 週次では `今の行動が4週間続いた場合の傾向` を示す
- 月次では `3か月 / 6か月 / 12か月` スパンの下方シナリオや遅延影響を示す
- 生活目標、収入目標、資産目標、自由時間目標、教育費などの将来支出とのギャップを整理する
- 出力は人格否定ではなく、`因果の鎖` と `現実コスト` と `失うものの具体像` を明確に示す
- 「甘い行動が続いた場合、どの生活目標がどれだけ遅れ、何が払えず、どの自由が失われるか」を具体化する

現実監査官スキルへの入力の最小セット:
- 週次の売上速報
- 月次の売上速報
- 回収見込み
- TODO完了率
- 改善TODO完了率
- 持ち越しTODO数
- 週次・月次の達成度報告
- 実行余力プロファイル
- 初回設定した生活プロフィール

現実監査官スキルが特に比較する軸:
- 現在の改善速度 vs 目標月収への到達速度
- 現在の回収見込み vs 月最低生活費
- 現在の蓄積速度 vs 目標資産到達時期
- 現在の稼働構造 vs 自由時間の最低ライン
- 現在の進捗速度 vs 教育費など将来支出の準備余力

`重要事実` の正式入力一覧（コード上は英語camelCase、仕様上は日本語説明を併記）:

1. `salesRecoveryFacts`
   - `grossRevenueSnapshot`
     - 売上速報の生値
   - `grossRevenueDelta`
     - 前回同期間比の差分
   - `grossRevenueTrendBand`
     - 売上速報の判定バンド（`improving` / `flat` / `worsening`）
   - `projectedRecoveryAmount`
     - 回収見込みの生値
   - `projectedRecoveryDelta`
     - 前回同期間比の差分
   - `projectedRecoveryTrendBand`
     - 回収見込みの判定バンド
   - `recoveryVsMinLivingCostGap`
     - 最低生活費との差分
   - `recoveryVsTargetTakeHomeGap`
     - 目標手取りとの差分
   - `recoverySafetyBand`
     - 生活安全上の判定バンド

2. `todoExecutionFacts`
   - `overallTodoCompletionRate`
     - 全TODO完了率の生値
   - `overallTodoCompletionDelta`
     - 前回同期間比の差分
   - `overallTodoCompletionTrendBand`
     - 全TODO完了率の判定バンド
   - `improvementTodoCompletionRate`
     - 改善TODO完了率の生値
   - `improvementTodoCompletionDelta`
     - 前回同期間比の差分
   - `improvementTodoCompletionTrendBand`
     - 改善TODO完了率の判定バンド
   - `carryoverTodoCount`
     - 持ち越しTODO数の生値
   - `carryoverTodoDelta`
     - 前回同期間比の差分
   - `carryoverTodoTrendBand`
     - 持ち越しTODO数の判定バンド

3. `goalCommitmentFacts`
   - `outcomeGoalProgressRate`
     - 成果目標の進捗率
   - `outcomeGoalProgressDelta`
     - 前回同期間比の差分
   - `outcomeGoalProgressTrendBand`
     - 成果目標進捗の判定バンド
   - `controllableCommitmentCompletionRate`
     - 行動約束の達成率
   - `controllableCommitmentDelta`
     - 前回同期間比の差分
   - `controllableCommitmentTrendBand`
     - 行動約束達成の判定バンド
   - `assetGoalGapAmount`
     - 目標資産との差分
   - `assetGoalGapDelta`
     - 前回同期間比の差分
   - `assetGoalTrendBand`
     - 資産目標進捗の判定バンド

4. `capacityFreedomFacts`
   - `availableHoursBand`
     - 確保可能時間帯
   - `availableHoursChangeBand`
     - 前回同期間比で見た時間確保状況の変化
   - `busynessLevel`
     - 忙しさレベル
   - `busynessChangeBand`
     - 前回同期間比で見た忙しさの変化
   - `freeTimeGapHours`
     - 最低自由時間との差分（時間）
   - `freeTimeGapDelta`
     - 前回同期間比の差分
   - `freeTimeTrendBand`
     - 自由時間ギャップの判定バンド

### Phase 5: 定期実行を追加する
- 日報・週報・月報の定期実行を追加する
- 最初は日報から自動化し、安定してから週報・月報へ広げる

推奨運用:
- 日報: 朝に前日を振り返る
- 週報: 週初の朝に前週を振り返る
- 月報: 月初の朝に前月を振り返る
- TODO実施報告: 毎日12時に、昨日の日報TODOと持ち越しTODOをチェックする（今日分は翌日12時に報告）
- 実行余力プロファイル: 12時チェックイン時に、週1回の簡易確認と月1回の少し深い確認を同時に回収する
- 達成度報告: 週報・月報の作成前に、前回の約束に対する結果を必ず回収する
- 現実監査官: 週報・月報の作成時だけ出現し、習慣のズレと長期リスクを可視化する
- 最終レポートは `Slack簡易要約 + surge.sh 公開HTML` の組み合わせで届ける

### Phase 6: AIの役割を後乗せする
AIは最初から全部任せず、次に限定します。
- 数字の意味づけ
- 注意点の文章化
- TODO候補の提案
- 方針の言語化
- レビューコメントの生成

AIに任せないもの:
- 数値集計
- 日付計算
- 入力チェック
- Slack送信フォーマットの骨格

## 最初の設計判断
技術選定（確定）:
- 実行環境: Node.js + TypeScript
- スケジュール: GitHub Actions（手動実行トリガーも必須）
- 通知先: Slack Incoming Webhook（`chat.postMessage`のみ）
- 保存先: **Supabase（PostgreSQL + REST API）**
  - GitHub Actionsからはsupabase-jsクライアントで読み書き
  - フォームのJavaScriptからはSupabase REST APIに直接POST
  - 常時起動サーバー不要
- HTML公開: surge.sh（レポート + チェックインフォーム）
- HTML生成: Tailwind CSS を使った固定テンプレート
- AI利用: `数字の解釈`、`TODO案`、`方針メモ`

Supabase構成:
- `daily_snapshots` テーブル（Shopee日次データ）
- `monthly_summary` テーブル（月次集計・3年保持）
- `tool_derived_data` テーブル（レポート草案・TODO・裁定ログ等）
- `external_tool_snapshots` テーブル（外部ツール由来データ）
- `checkin_results` テーブル（チェックイン回答）
- `user_profile` テーブル（初回プロフィール・余力プロファイル）

Supabase APIキーのセキュリティ方針（確定）:
- surge.sh公開フォームのJavaScriptには `anon key` を使用する
- anon keyはSupabaseが公開フォントからの使用を想定した設計であり露出しても安全
- ただし `Row Level Security（RLS）` を全テーブルに必ず設定する
- RLSポリシー: `checkin_results` はINSERTのみ許可、SELECT・UPDATE・DELETEは不可
- GitHub ActionsからのアクセスにはService Role Keyを使用し、GitHub Secretsに保管する

実装上の注意事項:
- タイムゾーン: GitHub ActionsはUTC基準のため、JST（UTC+9）のスケジュールに注意する
  - 毎朝8時JST = 23:00 UTC（前日）
  - 毎日12時JST = 03:00 UTC
  - cronは `0 23 * * *`（8時JST）/ `0 3 * * *`（12時JST）で設定する
- Shopee APIトークン: アクセストークンには有効期限がある。実API接続フェーズで自動リフレッシュ設計を追加する（MVP時点では不要・ダミーデータで動作）

## 注意点
- 現時点では Shopee API で何が本当に取得できるか未確定なので、**最初の最重要タスクはレポート用データの可視化**です。
- 月報は `注文ベース売上` と `Payment / Escrowベースの確定寄り数値` を混ぜないように設計する必要があります。
- 月報は、`速報値` と `確定寄り数値` を両方出し、明確に分離して表示する前提にします。
- コスト面では、AIを毎回全面利用すると割高になりやすいので、**まずはルールベース中心 + 要所だけAI** で始める前提にします。
- 毎日同じ判断軸に引っ張られないため、報告ツールと経営コンサルタントレビュー役は分離します。
- TODOの癖が固定化しないよう、`TODOレビュー役スキル` も別人格として分離します。
- Slackの対話機能は有力だが、ChatGPTの整理はあくまで参考情報とし、実装前に公式仕様を必ず再確認する
- 課題提出用の図解は、本体ツール完成後に別HTMLとしてまとめる方が作りやすいです。

## レポート設計の追加方針
迷いやすい前提に合わせ、各レポートでは必ず「行動」を先に見せます。

同時に、報告ツール本体は次の性質を守ります。

- できるだけ無機質に出す
- 感情的な言い回しを避ける
- 事実、推定、提案を分ける
- 毎回同じ構造で返す
- ルールベースで再現しやすい部分を優先する

また、TODO運用は次の思想で設計します。

- 出すだけで終わらせない
- 実施報告を次回判断に必ず反映する
- 書く負担を小さくする
- 未完了を責めるのではなく、構造問題の発見材料にする
- 実行余力を無視した理想TODOを作らない
- 少し背伸びするが、壊れるほど無理はさせない
- 週次・月次では、約束に対する結果報告を必須にする
- 週次・月次では、短期成果だけでなく長期の生活目標も思い出させる
- 単なる反省ではなく、「このままだと現実に何を失うか」を見せる

### 日報
- 今日やること `3件`
- やらないこと `1件`
- 時間配分 `午前 / 午後` または `分単位`
- 重要度と緊急度を分けた表示
- 12時チェックイン対象のTODO一覧

### 週報
- 今週やること `5件`
- 今週の重点テーマ `1つ`
- 週間の時間配分
- 先送りしてよいもの

### 月報
- 今月の重点テーマ `1つ`
- 今月の改善施策 `3件`
- 月内の投下時間配分
- 今月捨てる論点
- `速報値` と `確定寄り数値` を分けて表示

## 初版で入れる指標案
ユーザー側で指標選定を背負わない前提で、初版は次を推奨します。

### 日報の指標
- 注文数
- 注文ベース売上速報
- 未発送件数
- 低在庫SKU数
- キャンセル件数 / キャンセル率
- 返品・返金発生件数
- 売上上位SKU
- 売上下落SKU

### 週報の指標
- 週次売上速報
- 前週比
- 注文数前週比
- 未発送滞留の推移
- キャンセル率推移
- 返品率推移
- SKU別販売数の伸び / 落ち込み
- 重点確認テーマ

### 月報の指標
- 月次売上速報
- 前月比
- 注文数
- 平均注文単価
- Payment / Escrowベースの確定寄り回収見込み
- 手数料・送料などの負担感
- SKU別の貢献度
- 採算悪化候補SKU
- 翌月の重点テーマ

これらは、まず `経営改善に効きやすく、Shopeeデータから比較的取りやすい` ものを優先しています。

Shopee APIの役割分担の初期案:
- `Order API`: 注文数、売上速報、未発送、キャンセル、商品別販売数
- `Product API`: 商品一覧、SKU一覧、在庫、低在庫判定
- `Returns API`: 返品件数、返品ステータス、返品理由の集約
- `Payment / Escrow API`: 回収見込み、手数料、送料調整、クーポン負担、返品反映後の受取見込み

最重要整理:
- `売上速報` は Order API ベース
- `回収見込み` は Payment / Escrow ベース
- この2つは同じ意味の数字として混ぜない

## レビュー工程の方針
意思決定の偏りを避けるため、処理は次の二段構えにします。

1. `報告ツールちゃん` が無機質な草案を作る
2. `執行参謀` と `経営コンサルタント` が同じ草案を並列レビューする
3. `報告ツールちゃん` が固定ルールで競合を裁定し、統合案を作る
4. 週次・月次では `現実監査官スキル` が `統合案 + 重要事実` をレビューする
5. `報告ツールちゃん` が無機質な最終版を閉じる
6. 修正済みの最終版をSlackに送る

競合裁定の基本原則:
- `人格の上下関係` ではなく `論点別優先` で裁定する
- さらに `時間軸ルール` を入れ、`日報は執行参謀寄り、週報・月報は経営コンサル寄り` とする
- `現実監査官` は本文全体を支配せず、`長期リスク` と `生活影響` の枠で強く反映する
- `報告ツールちゃん` は思想を追加せず、`採用 / 一部採用 / 不採用 / 保留` の固定形式で統合する

`論点別優先` の正式ルール表:

1. `実行性`
   - 主担当: `執行参謀`
   - 補助: `経営コンサルタント`
   - 裁定原則: 重すぎるTODO、回らないTODO、余力に合わないTODOは `執行参謀` を優先する
   - 反映方針: 却下ではなく、原則として `縮小 / 分解 / 順延` のいずれかに変換する

2. `優先順位`
   - 主担当: `執行参謀` と `経営コンサルタント` の共同領域
   - 時間軸ルール:
     - `日報` は `執行参謀` 寄り
     - `週報 / 月報` は `経営コンサルタント` 寄り
   - 最終裁定ルール: まず `運用破綻防止ライン` を満たし、その残り余力で `戦略テーマ` を優先する

3. `代替戦略`
   - 主担当: `経営コンサルタント`
   - 補助: `執行参謀`
   - 裁定原則: 重点テーマの見直し、捨てる論点、別の打ち手は `経営コンサルタント` を優先する
   - 反映方針: ただし `執行参謀` が実行不能と判定した場合は、そのまま通さず `試験導入版` か `縮小版` に落とす

4. `長期生活影響`
   - 主担当: `現実監査官`
   - 裁定原則: 生活費、目標手取り、資産形成、自由時間、将来支出への影響は `現実監査官` を優先する
   - 反映方針: `警告枠 / 長期リスク枠` に強く反映し、本文やTODO本体は原則として乗っ取らせない

5. `表現整形`
   - 主担当: `報告ツールちゃん`
   - 裁定原則: 文体統一、事実 / 推定 / 提案の分離、章立てへの再配置は `報告ツールちゃん` が担当する
   - 反映方針: 新しい思想や主張は追加せず、意味を変えない最小限整形だけを行う

補助原則:
- `事実誤認 / 数値不整合` はレビュー競合で裁定せず、前処理で差し戻す
- `現実監査官` の強い表現は意味を弱めずに `警告専用枠` へ隔離する
- `報告ツールちゃん` は人格間の折衷案を創作せず、固定ルールに沿って整理する

帳票ごとのレビュー通過順と適用範囲:

### 日報
通過順:
1. `報告ツールちゃん` が日報草案を作成する
2. `執行参謀` と `経営コンサルタント` が同じ草案を並列レビューする
3. `報告ツールちゃん` が固定ルールで裁定し、日報最終版を閉じる
4. Slackへ送信する

適用範囲:
- `執行参謀`
  - 対象: `今日やること`, `やらないこと`, `時間配分`, `持ち越しTODOの扱い`
- `経営コンサルタント`
  - 対象: `優先順位`, `重点確認テーマ`, `短期方針メモ`
- `現実監査官`
  - 対象外

### 週報
通過順:
1. `報告ツールちゃん` が週報草案を作成する
2. `執行参謀` と `経営コンサルタント` が同じ草案を並列レビューする
3. `報告ツールちゃん` が固定ルールで裁定し、週報統合案を作る
4. `現実監査官` が `週報統合案 + 重要事実` をレビューする
5. `報告ツールちゃん` が無機質な最終版を閉じる
6. Slackへ送信する

適用範囲:
- `執行参謀`
  - 対象: `今週やること`, `週間時間配分`, `先送りしてよいもの`, `持ち越しTODO処理`
- `経営コンサルタント`
  - 対象: `今週の重点テーマ`, `優先順位の再配置`, `代替戦略`, `週次方針メモ`
- `現実監査官`
  - 対象: `長期リスク枠`, `生活影響枠`

### 月報
通過順:
1. `報告ツールちゃん` が月報草案を作成する
2. `執行参謀` と `経営コンサルタント` が同じ草案を並列レビューする
3. `報告ツールちゃん` が固定ルールで裁定し、月報統合案を作る
4. `現実監査官` が `月報統合案 + 重要事実` をレビューする
5. `報告ツールちゃん` が無機質な最終版を閉じる
6. Slackへ送信する

適用範囲:
- `執行参謀`
  - 対象: `今月の改善施策`, `月内の投下時間配分`, `実行負荷の調整`
- `経営コンサルタント`
  - 対象: `今月の重点テーマ`, `捨てる論点`, `代替戦略`, `月次方針メモ`
- `現実監査官`
  - 対象: `長期リスク枠`, `生活影響枠`

共通制約:
- すべてのレビュー役は `再執筆` ではなく `指摘 + 必要箇所だけ差し替え案` を返す
- すべてのレビュー役は `セクション限定` で作用し、帳票全体を乗っ取らない
- `報告ツールちゃん` はレビュー結果を受けて、固定ルールに従って統合する

`報告ツールちゃん` の裁定テンプレート（内部記録用、6スロット）:

1. `topicCategory`
   - 論点カテゴリ
   - 例: `executionFeasibility`, `priorityOrdering`, `alternativeStrategy`, `longTermLifeImpact`, `expressionFormatting`

2. `leadingRole`
   - その論点で主担当として扱う人格
   - 例: `executionStrategist`, `managementConsultant`, `realityAuditor`, `reportsToolChan`

3. `decision`
   - 判定
   - 値: `adopt`, `partial_adopt`, `reject`, `hold`

4. `decisionReason`
   - `理由タグ + 短い説明文`
   - 理由タグ例:
     - `over_capacity`
     - `strategy_misaligned`
     - `ops_guardrail_required`
     - `long_term_risk_detected`
     - `evidence_insufficient`
     - `formatting_only`

5. `appliedChange`
   - 実際に反映した内容
   - 例: `TODOを2件へ縮小`, `重点テーマを在庫圧縮から利益率改善へ変更`, `長期リスク枠に警告を追加`

6. `notAppliedChange`
   - 採用しなかった内容
   - 一部採用や不採用のときに残す
   - 例: `今週中の全面商品改修案は実行余力不足のため未採用`

`報告ツールちゃん` の表現禁止事項 / 口調制約:

- 基本方針:
  - `無機質だが読みにくすぎない`
  - `事実 / 推定 / 提案` を明確に分ける
  - 読みやすい自然文は許可するが、人格的な色は足さない

- 明確に禁止する表現:
  - 感情語
  - 励まし
  - 人格的感想
  - 一人称
  - 相手への叱咤激励
  - 過度な断定

- 文体ルール:
  - `事実:` `推定:` `提案:` のようにラベルで区切ることを許可する
  - 提案は命令口調ではなく、`提案:` を明示した推奨文で書く
  - 強い警告は `現実監査官` の担当とし、`報告ツールちゃん` 自身は強い語気を持たない
  - 章立てと用語を毎回できるだけ固定し、話し言葉を避ける

- 禁止例:
  - `頑張ってください`
  - `かなり危ないです`
  - `私はこう思います`
  - `今すぐ絶対にやるべきです`

- 許可例:
  - `事実: 未発送件数が前日比で増加`
  - `推定: 在庫確認の遅れが滞留要因の可能性`
  - `提案: 未発送処理を当日最優先とし、在庫確認を午後枠へ配置する`

経営コンサルタントスキルの役割:
- 草案の盲点を指摘する
- 優先順位が妥当かレビューする
- 過度な思い込みを崩す
- 代替案を出す
- 月次・週次の方針を磨く
- 約束と実績の差を見て、次に何を縮める・強めるべきかを判断する

現実監査官スキルの役割:
- 習慣のズレを指摘する
- 今の行動が続いた場合の将来像を示す
- 生活目標と事業行動の距離を可視化する
- 収入、資産、自由時間、教育費などへの影響を整理する
- 週次・月次で背筋が伸びる、現実的でやや脅しの効いた振り返りを作る

現実監査官スキルの出力方針:
- 感情的に怒鳴らない
- ただし甘く慰めない
- 「このまま続けた場合の下方シナリオ」を具体的に示す
- 生活への痛みを、抽象論ではなくリアルな項目で示す
- 例: 収入不足、資産形成の遅延、自由時間の減少、教育費計画の圧迫

初期版のレビュー方針:
- `超データドリブン`
- `理論的`
- `感情論より構造分析を優先`
- `どんな経営者でも事業を上向かせる前提で、必要だと思う観点を広くレビュー`
- `盲点、優先順位、代替戦略をすべて対象にする`

報告ツール本体の役割:
- 事実を集める
- ルールベースで整理する
- 草案を作る
- 再現性を担保する

TODOレビュー役スキルの役割:
- TODOの偏りを補正する
- 実行できないTODOを弾く
- 重すぎるTODOを分解させる
- 優先順位の順番を監査する
- 持ち越しTODOの構造原因を洗い出す
- 代替TODOを提示する
- 実行余力プロファイルに対して過剰なTODOを削る

TODOレビュー役スキルの推奨出力形式:
1. `維持TODO`
2. `修正TODO`
3. `却下TODO`
4. `追加TODO`
5. `並び替え理由`
6. `修正後の完成TODO一覧`

この形式により、
- 監査痕跡を残せる
- 何が問題だったか学習できる
- 最終的に使うTODO一覧もすぐ取り出せる

## チャット通知の位置づけ
チャット通知は将来の拡張機能として残します。

- 目的: buyerから来ていて未返信の会話を見逃さない
- 実行頻度: 1時間ごとの巡回を第一候補
- 判定: 最後のseller発言以降のbuyer発言群を未返信単位として扱う
- 出力: Slackへのポイント報告と返信判断補助

ただし初期版では、まずレポート基盤の完成を優先します。