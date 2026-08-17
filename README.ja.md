# dsh-jmcomic

日本語 · [English](./README.md) · [简体中文](./README.zh.md)

DeepSeek Harness プラグイン。サイドバーに comic ボタンを追加して、JMComic(18comic)の検索・ダウンロード、ローカル漫画ライブラリの閲覧、ウィンドウ内での読書ができます。

## 機能

- サイドバーの comic ボタン(スキルボタンの上)
- 小窓:ID かタイトルで検索してダウンロード。ローカルフォルダをバインドすると最近読んだ 2〜3 冊のカバーを表示し、クリックでそのまま読書開始
- 大モーダル:ローカルフォルダ内の全漫画をグリッド表示、クリックで章一覧へ
- 読書ウィンドウは端・角をドラッグで自由にリサイズ、上部バーで移動。サイズと位置は記憶されます
- 漫画を開き直すと、前回読んだ章とページに戻ります
- リーダー下部に現在ページ/総ページ数と、ページ番号入力でのジャンプ機能
- カードにホバーすると削除ボタン(ベースフォルダ内のアルバムのみ削除可。ルートやシステムディレクトリは保護)
- ダウンロード中はウィンドウ上部に downloading と表示
- 設定 → プラグイン → プラグイン設定 → jmcomic カードで既定フォルダと Python パスを変更
- 初回に環境が不完全だと一度だけヒントを表示(上流プロジェクトのリンク付き)

## スクリーンショット

![サイドバーの comic ボタン](assets/comic-trigger.png)

![小窓:検索 + ローカルカバー](assets/comic-pop.png)

![大モーダル:ローカルライブラリグリッド](assets/comic-library.png)

## オフライン対応

jmcomic 2.7.3 のソース、commonX、jmcomic-ai パッケージ、リーダーフロントエンドを同梱(`vendor/` 配下)しているので、jmcomic の PyPI パッケージを入れなくても動作します。バイナリ依存が無い場合は自動で縮退:

| 不足 | 動作 |
|---|---|
| curl_cffi | requests にフォールバック |
| Pillow | デコードなし。ファイルは DL できるがプレビュー不可 |
| pycryptodome | インストールを促す |

## インストール

```bash
dsh plugin --profile web add github:lywusichen/dsh-jmcomic
```

## ビルド

```bash
npm install   # esbuild
npm run build # lib/client.js と lib/server.cjs を生成
```

## 設定

- 設定ファイル:`~/.dsh/plugins/dsh-jmcomic/settings.json`(Windows)
- ダウンロードは api 直結、ディレクトリ規則 `Bd/{Atitle}/第{Pindex}話`、低並行(image 3 / photo 1)

## 免責事項

ダウンロードエンジン、リーダーフロントエンド、一部の補助スクリプトは hect0x7 のプロジェクトから来ており、`vendor/` 配下に同梱しています:

- [JMComic-Crawler-Python](https://github.com/hect0x7/JMComic-Crawler-Python) — ダウンロードエンジン
- [jm-view-server](https://github.com/hect0x7/jm-view-server) — リーダーフロントエンド
- [jmcomic-ai](https://github.com/hect0x7/jmcomic-ai) — 補助スクリプト

著作権は各作者に帰属します。
