# Shopee 図解 — 生成ゲート（品質・完了報告の SSOT）

**品質チェックリスト**と**完了報告テンプレ**は **本ファイルのみ**を正とする。  
他トピックの詳細は **下表の正本**を編集し、本ファイルには重複を書かない。

## 正本マップ（Single Source of Truth）

| トピック | 正本（編集は原則ここだけ） |
|----------|---------------------------|
| Shopee 画像制限・**Chrome スクショ手順**・2MB・tinypng | `references/shopee-specs.md` |
| メイン画像 1200×1200 の**固定レイアウト**（`.artboard` + `#shopee-main-canvas`・外枠フレーム・キャッチ帯・フッター列） | `references/main-image.html`（先頭コメント＋マークアップ） |
| 説明カード用 `<head>` / Tailwind 配色（800px） | `references/base.html` |
| サイズ倉庫・命名・優先順位・日本語→英語・分割スクショ・免除 | `references/size-charts/README.md` |
| Pattern A/B/C の判断 | カテゴリスキル（例: `shopee-outdoor-explainer/references/pattern-guide.md`） |
| Shopee 商品名の 100 字ルール・コードブロック出力 | `references/shopee-product-listing-title.md` |
| Shopee 商品名の SEO / AEO レビュー基準 | `../../shopee-product-name-seo-aeo-review/references/seo-aeo-rubric.md` |

## 画像カードの背景（`product-card` と `main-image` 共通）

| 背景 | 対応 |
|------|------|
| **白背景（最優先・デフォルト）** | **コンテナも白に同化**: `bg-white` + `border` + `rounded-xl`（余白は最小限〜なし） |
| 透過 PNG（実質は白に見せたい） | `bg-white` + `border` + `rounded-xl` |
| 薄灰〜灰（Amazon 型） | **背景が白に馴染まない場合のみ** `bg-sp-surface` + `border border-sp-border` + `rounded-xl` + メイン画像 `padding:6px` / サムネ `padding:4px` |

常に `border + rounded-xl + overflow-hidden` のカード形を維持。

## 品質チェック（生成直前）

- 英語のみか（Size Guide の見出し・注釈含む）
- `<img src="./variation-..">` が正しいか
- 価格・配送・返品が入っていないか
- **シリーズ・ラインナップ全体**の説明になっているか（単一型番だけに偏っていないか）
- 固定サイズ画像で **`.artboard` が `body` 直下**にあり、`html` / `body` / `.artboard` のサイズが一致しているか — `main-image.html`
- メイン画像が **1200×1200** か（`main-image.html` の固定ルールに一致し、**`.artboard` に外枠フレーム**があり、`#shopee-main-canvas` がその内側キャンバスとして収まっているか）
- **`main-image` の主要色面**（ヒーロー、キャッチ帯、右列、ギャラリー、フッター）が **白いガターでわずかに分離**され、**色面どうしが直接接していない**か。各ブロックの角が**控えめに丸められている**か — 詳細は `main-image.html`
- **ギャラリー行（Section 3）** が **内側キャンバス通し**で、右端までサムネが並び **右に白いデッドゾーンがない**か（省略時はコメントどおり Section 3 自体を出していないか）
- **`variation-total` が 1 かつ画像 1 枚のみ** → `main-image` に **下段ギャラリー（Section 3）を置いていない**か（置くなら `main-image.html` のSSOT違反）
- **`variation-total` が 1 かつ画像が複数** → 下段を **色一覧ではなく写真集**（別アングル・利用シーン等）として扱い、ラベルもそれに合っているか — `main-image.html` コメント
- **メインと下段で同じ `variation-XX.png` を参照していないか**（`01` はメインのみ、ギャラリーは `02` 以降のみ）— `main-image.html` コメント
- **フットウェア**なら `product-card` に **Size Guide**（HTML 表。チャート PNG の貼り付けだけで済ませていないか）— 詳細・免除は `size-charts/README.md`
- **複数チャート PNG** がある場合、重複行・列を除き **1 論理表**にしているか — `size-charts/README.md`
- **サイズが本質でない商品**で無理に Size Guide を入れていないか（逆も）
- **`main-image` 右列の短語**が、**根拠のないマーケっぽい創作**になっていないか（Amazon / 公式に現れる用語・素材名・技術名・明記スペックに紐づく短いラベルにする。根拠が薄いなら語を減らすか公式表現に寄せる）— `main-image.html` コメント
- **Shopee プロダクト名**を `references/shopee-product-listing-title.md` の手順で **Step 4e 最終行**まで確定したか
- **Shopee プロダクト名**が **100 文字以内**で再カウント済みか
- 完了報告に **Shopee プロダクト名**の **コードブロック**を含めたか（文字数はコードフェンス外、コードブロック内は 1 行のみ）

## 完了報告テンプレ

```text
完成: [商品名] — HTML2枚 + Shopeeプロダクト名

エクスプローラーを開きました。各HTMLをChromeにドラッグ＆ドロップして確認できます。

【スクリーンショット】手順の番号・用語は shopee-specs.md の「スクリーンショット手順（Chrome）」に合わせる。
  1. ChromeでHTMLを開いたら Ctrl+0 でズームを100%に設定
  2. F12 → Elements で `<body>` 直下の `.artboard` を選択
  3. Ctrl+Shift+P → "node screenshot" → "Capture node screenshot"
  4. ダウンロードされたPNGをShopeeにアップロード

【ファイル】
  - product-card-{slug}.html  → Description欄用（800px幅）
  - main-image-{slug}.html    → メイン画像用（1200×1200px・1:1）

【プロダクト名】
  使用文字数: N/100
  ```text
  [Step 4e で確定した Shopee プロダクト名 1 行のみ]
  ```

  ※ レビュー長文は完了報告に出さない。コードブロック内は商品名 1 行のみ。

ファイルサイズが2MBを超える場合: shopee-specs.md の記載（tinypng）に従う。
```

## 保存後（Windows）

生成完了後、出力フォルダを開く:

`explorer "{workspaceRoot}/output/shopee/{product-slug}"`（絶対パスでも可）
