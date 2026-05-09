# Shopee アウトドア図解スキル（Layer ②）

Shopee 向けの **アウトドア系** 商品説明図解（説明カード + メイン画像の HTML）を生成します。

## 共通ルール（Layer ①）

生成のたびに、先に次を読んでください。

- `.claude/skills/shopee-explainer-common/SKILL.md`
- 同フォルダの `references/`（`base.html` / `main-image.html` / `shopee-specs.md`）

寸法・禁止事項・品質チェック・スクショ手順はすべて **共通スキルが正本** です。

## 起動方法

チャットで **「アウトドア図解」** と入力して起動します（「商品図解」ではありません）。

## 入力（1 メッセージにまとめる）

1. Amazon 商品ページ URL  
2. 商品名（そのまま使用）  
3. 性別（Men's / Women's / Unisex / なし）  
4. バリュエーション総数  
5. バリュエーション画像（添付・最大 4 枚推奨）

## 出力先

`output/shopee/{商品スラッグ}/`

## このスキル内の参照

- `references/pattern-guide.md` — A / B / C の選び方  
- `references/pattern-a-feature.html` など — レイアウト見本  
- `references/module-guide.md` / `model-*.html` — 部品の参考  

## シューズ・アパレルのサイズ

優先順位・Unisex＝mens・「数値だけ抽出してカード内 HTML 表に再構成」などは **`../shopee-explainer-common/references/size-charts/README.md`** を正とする。
