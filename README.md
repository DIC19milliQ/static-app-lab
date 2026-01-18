# Static App Lab

Static App Lab は、**バックエンドなしで動作する静的 Web アプリの実験場**です。IndexedDB、Service Worker、ES Modules だけで完結し、外部ライブラリやビルドツールは不要です。複数の「ラボ」を通じて、データ処理・メディア編集・計算・オフライン挙動を体験できます。

## ラボ一覧
- **Local DB Lab**: IndexedDB を使った CRUD、検索/フィルタ/ソート、インポート/エクスポート。
- **Data Viewer**: CSV/JSON を読み込み、列の表示切替・検索・ソート・エクスポート。
- **Media Lab**: 画像の回転/反転/トリミング/リサイズ、PNG/JPEG 書き出し。PDF は簡易プレビューのみ。
- **Calculator Lab**: 積立貯蓄の成長シミュレーション、年次表と簡易チャート。
- **Offline/PWA**: Service Worker とキャッシュの状態、更新フローの可視化。

## ローカル実行（ビルド不要）
Service Worker を有効にするため、ローカルサーバーでの起動を推奨します。

**Option A:**
```bash
npx serve
```

**Option B:**
```bash
python -m http.server
```

実行後、表示されたローカル URL をブラウザで開いてください。

> 注: `index.html` を直接ダブルクリックして開くと UI は表示できますが、PWA/オフライン機能は制限されます。

## Offline/PWA テスト手順
1. オンラインで一度ロードしてキャッシュを作成します。
2. ネットワークをオフにします。
3. ページを再読み込みして動作確認します。
4. ネットワークを戻し、Offline/PWA タブで「Check for update」を押します。

## Testing
ローカルでテストを実行する前に依存関係をインストールします。

```bash
npm install
```

Lint とユニットテストは以下で実行できます。

```bash
npm run lint
npm test
```

## バックエンド不要・外部依存なし
このプロジェクトは HTML / CSS / JavaScript のみで構成され、すべてのデータはブラウザ内に保存されます。データビューアやメディア編集も、ファイルをアップロードせずにローカルで処理されます。
