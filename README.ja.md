# dsh-jmcomic

**日本語** · [English](./README.md) · [简体中文](./README.zh.md)

DeepSeek Harness プラグイン:サイドバー下部に **comic** ボタンを追加し、JMComic(18comic)の検索・ダウンロード、ローカル漫画ライブラリの閲覧、内蔵リーダーを提供します。

## 機能

- **サイドバーボタン**:サイドバー下部の「comic」トリガー(スキルボタンの上)。
- **小窓**:検索ボックス(ID/タイトル入力)+ 「ローカルフォルダをインポート」ボタン。フォルダバインド後は最近読んだ/ダウンロードした 2〜3 枚のカバー + 「その他」ボタンを表示。
- **大モーダル**:中央・背景ぼかしのグリッドでローカルフォルダ内の全漫画を表示。漫画をクリックして章一覧へ、章をクリックして**モーダル内で直接読書**(jm-view-server リーダーを再利用:スクロール/単頁/双頁、サムネイル一覧、回転、ショートカットキー)。
- **設定**:設定 → プラグイン → プラグイン設定 → jmcomic カードで既定フォルダと Python パスを変更。大モーダル内にも「フォルダ変更」ボタン。
- **初回ヒント**:初回ロード時に jmcomic 環境が不完全と検出された場合、一度だけインストール推奨ダイアログを表示(GitHub リンク付き)。
- **ドラッグ可能**:小窓と大モーダルの両方をドラッグ移動できます。
- **削除**:ライブラリのカードにホバーすると削除ボタンが表示(ガード付き:ベースディレクトリ内のアルバムのみ削除可。ルートやシステムディレクトリは禁止)。
- **ダウンロードバナー**:ダウンロード中は小窓と大モーダルの上部に "downloading …" を表示。

## オフライン対応

プラグインに同梱:

- `vendor/python/jmcomic` — JMComic-Crawler-Python 2.7.3 ソース
- `vendor/python/common` — commonX 純 Python ソース
- `vendor/python/jmcomic_ai` — jmcomic-ai パッケージ(同梱スクリプト用)
- `vendor/scripts/*.py` — ダウンロード/検索/変換スクリプト
- `vendor/viewer/static` — jm-view-server リーダー フロントエンド

**jmcomic PyPI パッケージが未インストールでも動作します。** 不足するバイナリ依存は自動で縮退:

| 不足 | フォールバック |
|---|---|
| curl_cffi | postman は requests を使用 |
| Pillow | 画像デコード無効(ファイルは DL 可能だがプレビュー不可) |
| pycryptodome | インストールを促す |

## インストール

```bash
dsh plugin --profile web add github:lywusichen/dsh-jmcomic
```

## ビルド

```bash
npm install   # 開発依存: esbuild
npm run build # lib/client.js + lib/server.cjs を生成(コミット済み)
```

## 自己診断

```bash
node selfcheck.cjs   # stub ctx で全 /jmcomic/* ルートを検証
```

## 設定

- 設定ファイル:`~/.dsh/plugins/dsh-jmcomic/settings.json`(Windows)
- ダウンロード戦略(実戦検証済み):`client.impl: api` 直結、ディレクトリ規則 `Bd/{Atitle}/第{Pindex}話`、低並行(image 3 / photo 1)。

## 免責事項

本プラグインのダウンロードエンジン・リーダーフロントエンド・補助スクリプトは、**hect0x7** のオープンソースプロジェクトを参考に(一部改変して)構築されています:

- [JMComic-Crawler-Python](https://github.com/hect0x7) — 同梱ダウンロードコア(`vendor/python/jmcomic`、commonX)
- [jm-view-server](https://github.com/hect0x7) — 同梱リーダーフロントエンド(`vendor/viewer/static`)
- [jmcomic-ai](https://github.com/hect0x7) — 同梱補助スクリプトとサービス層(`vendor/python/jmcomic_ai`、`vendor/scripts`)

元プロジェクトの著作権は各作者に帰属します。本プラグインは独立した統合であり、オフライン動作のために元のライセンスに基づき上記ソースを同梱しています。

## 謝辞

- [JMComic-Crawler-Python](https://github.com/hect0x7/JMComic-Crawler-Python) — ダウンロードエンジン
- [jm-view-server](https://github.com/hect0x7/jm-view-server) — リーダーフロントエンド
- [jmcomic-ai](https://github.com/hect0x7/jmcomic-ai) — 補助スクリプト
