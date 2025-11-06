# 設定指南

## 安裝

```bash
git clone https://github.com/Heiso-admin/Core-BEE.git
cd Core-BEE
pnpm install
```

---

## 環境設定

建立 `.env.local`：

```env
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
NEXTAUTH_SECRET=your-secret-32-chars  # openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000
OPENAI_API_KEY=sk-xxx  # 選用
```

---

## 資料庫

```bash
pnpm db:push  # 套用 schema
pnpm dev      # 啟動伺服器
```

---

## 首位使用者

1. 造訪 `http://localhost:3000/signup`
2. 建立帳號
3. 登入

---

## 開發者存取

**必須**才能存取 `/dev-center`：

```bash
pnpm db:studio  # 於 localhost:4983 開啟
```

1. 前往 `developers` 資料表
2. 從 `users` 資料表取得您的 `userId` 並新增記錄
3. **登出並重新登入**（必須！）
4. 存取 `/dev-center`

**疑難排解**：如仍看到「Only admin can access」，請清除 cookies 並重新登入。

---

## 存取層級

- **Developer**：完整存取（在 `developers` 資料表中）
- **Owner**：組織管理員（`members.isOwner = true`）
- **Member**：基於角色的權限

---

## Dev Center 設定

透過 `/dev-center`：

**權限與角色**：
- 定義資源（`users`、`reports` 等）
- 設定操作（`read`、`write`、`delete`）
- 建立角色模板
- 指派給團隊/成員

**API Keys**：
1. 建立：名稱 + Scopes + 到期時間
2. 使用：`Authorization: Bearer <key>`
3. 輪替：自動或手動
4. 撤銷：立即失效

**安全**：
- ✅ 儲存於 secrets manager
- ✅ 最小範圍（最小權限）
- ✅ 每 90 天輪替
- ❌ 絕不提交至程式碼

**服務**：
- AWS S3 憑證
- Resend email 金鑰
- OpenAI API 金鑰

**自訂**：
- 選單結構與可見性
- `config/index.ts` 品牌設定

---

## 快速工作流程

1. **定義資源**：Dev Center → Permissions
2. **建立角色**：Dev Center → Roles
3. **發行 API 金鑰**：Dev Center → API Keys
4. **測試**：Dev Center → API Docs
5. **部署**：將金鑰儲存於 secrets manager

---

## 疑難排解

**「Only admin can access」**：
1. 驗證 `userId` 在 `developers` 資料表中
2. **登出並重新登入**（必須）
3. 清除 cookies
4. 重啟伺服器

**API 金鑰無法運作**：
1. 檢查到期時間
2. 驗證 scopes 符合端點
3. 確保標頭格式正確
4. 確認金鑰未被撤銷
