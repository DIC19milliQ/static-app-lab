# Static App Lab: LocalDB Studio

LocalDB Studio は、**バックエンドなしで動作するオフラインファーストの限界と可能性**を示す静的デモアプリです。IndexedDB、ES モジュール、Service Worker だけでブラウザ内に完結し、フレームワークやビルドツール、外部依存は使いません。

## このデモで示すこと
- List / Editor / Import-Export / Dashboard / Settings のタブを備えたリッチ UI。
- 検索・フィルタ・ソートと、大量データ向けの仮想リストによる CRUD。
- IndexedDB による永続化と、PWA のオフライン動作。
- JSON / CSV のインポート・エクスポート。
- 100 件 / 10,000 件のサンプル生成によるパフォーマンス確認。

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

## 動作確認チェックリスト
- [ ] レコードの作成・編集・複製・アーカイブ・削除。
- [ ] 10,000 件を生成し、リストが操作可能なままであること。
- [ ] JSON / CSV のエクスポートとインポート。
- [ ] オフラインテスト（ネットワーク切断 → リロード → 動作確認）。
- [ ] Service Worker 更新（ファイル変更 → リロード → 更新バナーで反映）。

## Offline/PWA の動作
Service Worker がアプリシェル（`index.html`、CSS、JS モジュール、manifest）をキャッシュし、オフラインでも動作します。更新が検出されるとバナーが表示され、リロードで新しいバージョンを有効化できます。

## データモデル
各レコードの構成:
- `id`（uuid）
- `title`
- `body`
- `tags`（文字列配列）
- `status`（`active` | `archived`）
- `rating`（0–5）
- `createdAt` / `updatedAt`（ISO タイムスタンプ）

## バックエンド不要・外部依存なし
このプロジェクトは HTML / CSS / JavaScript のみで構成され、すべてのデータはブラウザ内に保存されます。
