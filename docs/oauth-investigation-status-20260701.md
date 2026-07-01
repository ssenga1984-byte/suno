# Decap CMS GitHub OAuth 認証 — 調査ステータス

> 作成日: 2026-07-01
> 目的: Codex による追加調査用の現状整理

## 概要

JUON NETWORK 静的サイト（React/Vite/Tailwind、Netlify デプロイ）に Decap CMS v3 の管理画面を追加。非エンジニアの事務局スタッフがコンテンツを編集できるようにする。CMS ログインボタン「GitHub でログインする」をクリックすると **404 エラー**が返る問題を調査した。

## 環境情報

| 項目 | 値 |
|---|---|
| Netlify サイト名 | `juon-site-preview-20260516` |
| Netlify サイト ID | `88fd79f6-e1d9-4554-8807-80152b9a666a` |
| サイト URL | https://juon-site-preview-20260516.netlify.app |
| CMS URL | https://juon-site-preview-20260516.netlify.app/admin/ |
| GitHub リポジトリ | `satoshi19840417/suno` |
| CMS バックエンド | `github`（`git-gateway` ではない） |
| Netlify Identity | 有効（登録: Open） |

## 根本原因

**GitHub アカウント `satoshi19840417` がフラグ付き（flagged）になっている。**

GitHub ダッシュボードに以下のバナーが表示されている:

> "This account is flagged, and therefore cannot authorize a third party application."

このフラグにより、このアカウントで作成した OAuth App は正常に設定されていても、OAuth 認可エンドポイント (`https://github.com/login/oauth/authorize?client_id=...`) が **404** を返す。アプリの設定やNetlify側の問題ではない。

## OAuth App の状態

### 旧 OAuth App（削除済み）
- Client ID: `Ov23lijASfpStIl0lX6d`
- ステータス: GitHub 側で削除済み
- **注意: Netlify の OAuth プロバイダーにはまだこの旧 Client ID が登録されたまま**

### 新 OAuth App（作成済み・未使用）
- Client ID: `Ov23ctN6HtnAKpHKGDIa`
- Client Secret: `REDACTED`（平文保存禁止。必要な場合はGitHubで再発行する）
- Homepage URL: `https://juon-site-preview-20260516.netlify.app`
- Authorization callback URL: `https://api.netlify.com/auth/done`
- ステータス: GitHub 側に存在するが、アカウントフラグにより OAuth 認可が不可

## CMS 設定ファイル

### `public/admin/config.yml`
```yaml
backend:
  name: github
  repo: satoshi19840417/suno
  branch: main
```

### `public/admin/index.html`
- Netlify Identity Widget (`https://identity.netlify.com/v1/netlify-identity-widget.js`) を読み込み済み
- Decap CMS スクリプトを読み込み済み
- EventPreview カスタムコンポーネントあり

### `public/_headers`
- CSP に `identity.netlify.com`, `unpkg.com`, `api.github.com`, GitHub OAuth 関連ドメインを追加済み

## 解決に必要なアクション

### 最優先: GitHub アカウントフラグの解除
1. **GitHub Support に連絡** — https://support.github.com/contact からフラグ解除を依頼
2. または**別の GitHub アカウント**を使用して OAuth App を作成し直す

### フラグ解除後の手順
1. **Netlify OAuth プロバイダーの更新**
   - Netlify ダッシュボード > Site configuration > Access & Security > OAuth
   - 旧プロバイダー（Client ID: `Ov23lijASfpStIl0lX6d`）をアンインストール
   - 新しい Client ID (`Ov23ctN6HtnAKpHKGDIa`) と Client Secret で再インストール
2. **CMS ログインテスト**
   - https://juon-site-preview-20260516.netlify.app/admin/ にアクセス
   - 「GitHub でログインする」をクリック
   - GitHub の OAuth 認可画面が表示されることを確認
3. **セキュリティ強化**
   - Netlify Identity の登録を「Open」から「Invite only」に変更することを検討

## 代替アプローチの検討

GitHub アカウントフラグの解除に時間がかかる場合:

1. **別の GitHub アカウントで OAuth App を作成** — 最も早い回避策
2. **`git-gateway` バックエンドに切り替え** — Netlify Identity + Git Gateway を使えば GitHub OAuth App が不要になる。ただし Netlify Identity の設定変更が必要
3. **Netlify CMS → CloudCannon や Tina 等の別 CMS に移行** — 大掛かりなため非推奨

## 調査で排除済みの原因

- ✅ OAuth App の設定ミス（Client ID, Callback URL 等）— 正しく設定されている
- ✅ Netlify 側の設定ミス — Identity 有効、OAuth プロバイダー設定済み
- ✅ CSP ヘッダーのブロック — 必要なドメインは許可済み
- ✅ Decap CMS の設定ミス — `config.yml` は正しい
- ✅ OAuth App の破損 — 新規作成しても同じ結果（アカウントフラグが原因）
