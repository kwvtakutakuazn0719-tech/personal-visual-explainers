---
name: creating-visual-explainers
description: Generates an illustrated HTML page about any topic and deploys or removes it on surge.sh. Triggered by requests like "図解を作って", "図解を生成して", "このトピックを図解して", "この図解を公開して", or "この図解を削除して".
---

# Creating Visual Explainers

任意のトピックについて、前提知識がなくても理解できる図解HTMLを生成し、surge.sh に公開する。品質基準は「入社したての新卒社会人が読んでも腹落ちする明快さ」だが、この基準は出力には表示しない。

## 正本

- `references/base.html` — 図解テンプレート。額縁・プレースホルダー・読み込み済みリソースの正本
- `references/model-answer.html` — 完成品質とビジュアル語彙の正本
- `references/content-guide.md` — コンテンツ生成ルールと表現パターンの正本
- `references/publishing.md` — 公開・再公開・削除・完了報告の正本
- `references/node-install-guide.md` — Node.js 未導入時だけ読む

## 分岐

- **新しく図解を作る** → Step 0 から順に進む
- **既存HTMLを公開する** → Step 5 の前に `references/publishing.md` を読む
- **図解を削除する** → 生成手順は飛ばし、`references/publishing.md` の削除手順に進む

## ワークフロー

### トピック（図解のテーマ）

- **通常の依頼**（「図解して」など）で、会話にトピックが無い・曖昧なら **Step 0 の前に**一文以上で確認する（質問は最小限にし、質問攻めにしない）。
- **ワークスペースに「図解」一言メニューと「汎用図解（選択後）」ルールがある場合**（例: 本リポの `.cursor/rules/diagram-single-word-trigger.mdc`）、そのルールで **テーマが確定済み**なら **同じ確認を繰り返さない**。未確定なら **ルールどおり先に確定**させてから Step 0 に入る。

### Step 0: 必須ファイル確認

`references/base.html` と `references/model-answer.html` が存在するか確認する。

欠けている場合は、以下を伝えて終了:

> テンプレートファイルが見つかりません。スキルのフォルダ構成が壊れている可能性があります。運営に連絡してください。

### Step 1: 正本を読む

1. `references/model-answer.html` を読み、完成品の品質水準・情報量・視覚表現を把握する  
2. `references/base.html` を読み、テンプレートの額縁とプレースホルダーを把握する  
3. `references/content-guide.md` を読み、生成時の禁止事項・構成・ビジュアル方針に従う

模範回答はデザインガイドラインの代わりであり、部品一覧ではなく実物として読む。テンプレートや模範回答の情報を `SKILL.md` に再転記しない。

### Step 2: ウェブで情報収集

トピックについてウェブ検索を行い、正確かつ最新の情報を集める。検索は **2〜3回** に絞り、少なくとも次を押さえる:

- 正確な定義や公式ドキュメント
- 最近の変更点や現在のベストプラクティス
- たとえ話や具体例に使える事例
- 採用した情報の出典URL

AIの学習データだけに頼らず、検索結果で確認できた定義・事実・具体例を優先する。

### Step 3: コンテンツ生成

Step 2 の情報をもとに、図解コンテンツを生成する。レイアウトは `references/model-answer.html` を参考にしつつ、Tailwind CSS の語彙で自由に組む。検索結果で得た定義・事実・数字を採用した箇所には、`references/content-guide.md` の方針どおりインライン出典を添える。

### Step 4: ファイル作成

1. `output/` ディレクトリがなければ作成する
2. トピックに関連する短い英単語のスラッグを決める
3. `references/base.html` を `output/{スラッグ}.html` にコピーする
4. コピー先でタイトル・説明・本文のプレースホルダーを置換する
5. ファイルを保存する。ローカル確認のためにブラウザを開くのは公開フローの後に行う

### Step 5: 公開・再公開・削除

この段階で `references/publishing.md` を読み、該当する手順に従う:

- 生成した `output/{スラッグ}.html` を新規公開する
- 既存の HTML ファイルを再公開する
- 直近に公開した図解を削除する

Node.js が未導入なら `references/node-install-guide.md` を使って案内する。公開系のコマンドや完了メッセージは `references/publishing.md` を正本とする。

### Step 6: 完了報告

公開成功時・公開未完了時ともに、`references/publishing.md` のテンプレートに従って報告する。

## 守ること

- 詳細ルールは `references/` を正本とし、ここに重複転記しない
- スクリプトが指定されている処理は、中身を説明するのではなく実行する
