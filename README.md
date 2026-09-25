# 日本一クイズ

家族で遊べる「日本一」クイズ。スマホ1台を回して、最大5人で正解数を競います。

- 設計：[DESIGN.md](DESIGN.md)
- 問題の一覧と出典：[QUESTIONS.md](QUESTIONS.md)
- 問題データ：[src/data/questions.json](src/data/questions.json)

## 手元で動かす

```bash
npm install
npm run dev
```

ブラウザで http://localhost:5173 を開きます。

## よく使うコマンド

| コマンド | 内容 |
|---|---|
| `npm run dev` | 開発サーバー |
| `npm test` | テスト（ゲームの進行・出題・問題データのチェック） |
| `npm run check` | 書き方のチェック（Biome） |
| `npm run format` | 自動整形 |
| `npm run build` | 公開用のファイルを `dist/` に作る |
| `node scripts/make-icons.mjs` | アプリのアイコン（PNG）を作り直す |

## 問題を追加する

1. `src/data/questions.json` に1問ぶん追加する（形式は既存の問題と同じ。ふりがなは `{漢字|よみ}`）
2. `npm test` で形式の間違いがないか確かめる
3. `QUESTIONS.md` の表にも追記する

`id` は `ジャンル-3桁の番号`（例：`food-003`）で、あとから変えないでください。

## GitHub Pages で公開する

1. GitHub でリポジトリを作り、このフォルダを `main` ブランチに push する
2. リポジトリの **Settings → Pages → Build and deployment → Source** で **GitHub Actions** を選ぶ
3. 以降は `main` に push するたびに、チェック・テスト・ビルドのあと自動で公開される

公開先は `https://<ユーザー名>.github.io/<リポジトリ名>/` です（パスは相対指定なので、リポジトリ名は自由です）。
