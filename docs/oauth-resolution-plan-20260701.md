# Decap CMS GitHub OAuth 解決計画書

作成日: 2026-07-01
対象: `juon-site-preview-20260516` / Decap CMS 管理画面

## 目的

Decap CMS の「GitHub でログインする」が 404 になる問題を解消し、事務局スタッフが管理画面からコンテンツ更新できる状態に戻す。

## 確定方針

最短復旧を優先し、GitHub 側で flag されていない JUON 用管理アカウントを使って OAuth App を作り直す。

選定理由:

- 既存アカウント `satoshi19840417` の flag 解除待ちに依存しない。
- 個人アカウント依存を減らし、将来の引き継ぎがしやすい。
- Decap CMS の `github` backend を維持でき、`git-gateway` への大きな方式変更を避けられる。

## 実施済み

### 1. GitHub 管理アカウント作成

新規GitHubアカウント `ssenga1984-byte` を作成した。

確認済み:

- メールアドレスは GitHub 上で `Verified`。
- GitHub OAuth App の作成権限あり。

### 2. GitHub OAuth App 作成

`ssenga1984-byte` 上に OAuth App を作成した。

設定値:

- Application name: `JUON Site CMS`
- Homepage URL: `https://juon-site-preview-20260516.netlify.app`
- Authorization callback URL: `https://api.netlify.com/auth/done`
- Client ID: `Ov23liH2rvIgagcSMZt7`

注意:

- Client Secret は生成済みだが、計画書・チャット・リポジトリには保存しない。
- 以前の調査メモに平文で残っていた旧Secret相当の情報は漏えい扱いで、使わない。

### 3. Netlify OAuth provider 差し替え

Netlify `juon-site-preview-20260516` の Access & security > OAuth で、旧GitHub provider を削除し、新Client IDのGitHub providerを登録した。

確認済み:

- 旧 Client ID: `Ov23lijASfpStIl0lX6d` は削除。
- 新 Client ID: `Ov23liH2rvIgagcSMZt7` がNetlify上に表示されている。
- CMSログインを押すと、404ではなくGitHubのOAuth認可画面に到達する。

## 現在の未完了点

GitHub認可画面で `Authorize ssenga1984-byte` ボタンが disabled のままになっている。

確認済み:

- 404は解消済み。
- OAuth AppのClient IDは新しいものに切り替わっている。
- GitHub認可画面は表示される。
- `ssenga1984-byte` のメールはVerified。
- GitHubページ内に明示的なエラーメッセージはない。

現時点の推定:

- in-appブラウザ上のGitHub OAuth画面で、承認ボタンが有効化されないブラウザ/セッション由来の問題の可能性が高い。
- GitHub側の新規アカウント・新規OAuth Appに対する一時的な制限の可能性も残る。

## 2026-07-01 実装結果

実装として完了した範囲:

- Netlifyの旧GitHub OAuth providerを削除した。
- Netlifyに新しいGitHub OAuth providerを登録した。
- Netlify上のClient IDが `Ov23liH2rvIgagcSMZt7` になっていることを確認した。
- Decap CMSのログイン導線が、404ではなくGitHubのOAuth認可画面へ進むことを確認した。
- GitHubアカウント `ssenga1984-byte` のメールアドレスが `Verified` であることを確認した。

未完了として残った範囲:

- in-appブラウザではGitHub認可画面の `Authorize ssenga1984-byte` が disabled のままになる。
- 通常ブラウザで同じ `/admin/` から認可を完了する必要がある。

この時点での判断:

- 元の404問題は解消済み。
- 残りはCMS設定やNetlify OAuth providerの不備ではなく、GitHub認可画面での最終承認操作に限られる。

## 次のアクション

### Phase 1: 通常ブラウザでOAuth認可を完了する

1. ChromeまたはEdgeで `https://juon-site-preview-20260516.netlify.app/admin/` を開く。
2. GitHubアカウント `ssenga1984-byte` でログインしていることを確認する。
3. 「GitHub でログインする」を押す。
4. GitHubの認可画面で `JUON Site CMS` の内容を確認する。
5. `Authorize ssenga1984-byte` が押せる場合は承認する。
6. Decap CMSの管理画面に戻ることを確認する。

成功条件:

- `/admin/` が 404 ではなくCMS画面へ遷移する。
- CMS上でイベント募集などのコレクション一覧が見える。

### Phase 2: リポジトリアクセス確認

CMSログイン後、次を確認する。

1. `content/events` の既存JSONが一覧表示される。
2. 既存イベントを開ける。
3. 下書き保存または小さなテスト編集ができる。
4. GitHubにcommitが作成される。
5. Netlify deployが走る。

注意:

- 本番表示に影響する編集は、最初は `draft` かテスト用内容に限定する。
- 直接公開される変更を試す場合は、事前に戻し方を決める。

### Phase 3: セキュリティ後処理

1. 旧OAuth Appと旧Client Secretが使われていないことを確認する。
2. `docs/oauth-investigation-status-20260701.md` から平文Secretを削除または伏字化する。
3. GitHub App / OAuth Appの所有者、復旧メール、2FA、引き継ぎ先を管理台帳に記録する。
4. Netlify IdentityのRegistrationを `Open` から `Invite only` に変更するか判断する。

## 代替案

通常ブラウザでも `Authorize` がdisabledのままなら、次の順で切り分ける。

1. GitHubに一度サインアウトし、`ssenga1984-byte` だけでログインし直す。
2. 24時間程度待って新規アカウント・新規OAuth Appの制限が解けるか確認する。
3. OAuth Appを既存の信頼済みGitHubアカウントまたはGitHub Organization配下に作り直す。
4. それでも不可なら、Decap CMSの認証方式を再検討する。

`git-gateway` は短期回避策としては候補に残すが、Netlify側でdeprecated扱いのため、第一候補にはしない。

## 完了条件

- CMSログイン時にGitHub OAuth 404が出ない。
- `ssenga1984-byte` またはJUON管理アカウントでCMSにログインできる。
- CMSから対象コンテンツを読み書きできる。
- GitHub commitとNetlify deployまで確認できる。
- 秘密情報がリポジトリ・チャット・計画書に残っていない。

## 2026-07-01 追加実施結果

- `satoshi19840417/suno` への collaborator 招待は GitHub 側で `User could not be added` / `You can't perform that action at this time.` となり失敗した。
- 代替として `ssenga1984-byte/suno` を新規作成した。
- `public/admin/config.yml` の Decap CMS backend repo を `ssenga1984-byte/suno` に変更した。
- `ssenga1984-byte` の GitHub SSH keys に `JUON CMS deploy key 20260701` を追加した。
- `juon-site` のクリーンコピーを `ssenga1984-byte/suno` の `main` に初期投入した。
- Netlify production deploy を実行し、公開済み `https://juon-site-preview-20260516.netlify.app/admin/config.yml` が `repo: ssenga1984-byte/suno` を返すことを確認した。
- in-app browser では Decap CMS のポップアップ復帰制約により管理画面内への復帰までは確認できていないが、OAuth callback は `Authorized` まで到達することを確認した。
