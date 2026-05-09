# Shopee Image Specifications

ShopeeのDescription欄にアップロードできる画像の仕様。

## 画像サイズ制限

| 項目 | 制限値 |
|---|---|
| 最小幅 | 700px |
| 最小高さ | 32px |
| 最大ファイルサイズ | 2.0 MB |
| アスペクト比 | 0.5〜32（縦長〜横長） |

Shopee 図解フローが生成する説明カード HTML は幅 800px 固定のため、最小幅の条件は自動的に満たされる。

## スクリーンショット手順（Chrome）

1. HTMLファイルをChromeで開く
2. `Ctrl+0` でズームを100%に設定する
3. `F12` でDevToolsを開く
4. `Ctrl+Shift+P` でコマンドパレットを開く
5. `screenshot` と入力 → **「Capture full size screenshot」** を選択
6. 保存されたPNGがDownloadsフォルダに入る

> 「Capture full size screenshot」はページ全体（スクロール不要）を1枚のPNGとして保存する。

## ファイルサイズが2MBを超える場合

https://tinypng.com にアクセスし、PNGをドロップして圧縮する（無料・高品質）。
通常、Tailwindで生成したHTMLのスクリーンショットは圧縮後 300KB〜800KB 程度に収まる。

## アップロード順序

Description欄の画像は上から順番に表示される。
ファイル名に連番プレフィックスを付ける運用をしている場合は、その番号順にアップロードする。
