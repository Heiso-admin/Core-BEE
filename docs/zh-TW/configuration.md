# 設定

## 網站配置

`config/index.ts`：
```typescript
const config = {
  site: {
    name: 'Your App',
    domain: 'yourdomain.com',
    copyright: '© 2024 Your Co',
    logo: { url: '/images/logo.png', title: 'Logo' }
  }
}
```

---

## 環境變數

```env
# 必要
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
NEXTAUTH_SECRET=your-secret  # openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000

# 選用
OPENAI_API_KEY=sk-xxx
NEXT_PUBLIC_SITE_ENDPOINT=http://localhost:3000
```

**優先順序**（dotenv-flow）：`.env.local` > `.env.[NODE_ENV]` > `.env`

---

## Dev Center

### 團隊與角色

**團隊**：Dev Center → Teams
- 建立團隊、指派成員、設定權限

**角色**：Dev Center → Roles
- 建立可重用的權限模板
- 指派給團隊或使用者

### API Keys

Dev Center → API Keys

**建立**：名稱 + Scopes + 到期時間  
**使用**：`Authorization: Bearer <key>`  
**安全**：儲存於 secrets manager，絕不放在程式碼中

**Scopes**：
- 資源：`users`、`reports` 等
- 操作：`read`、`write`、`delete`
- 擁有權：`own`、`team`、`org`

**輪替**：
- 自動：設定間隔（例如 90 天）
- 手動：透過 UI
- 輪替期間的寬限期

### 選單

Dev Center → Menu
- 標籤、圖示、路由、權限、父選單
- 拖放重新排序
- 可見性規則

### Keys 儲存

儲存憑證：AWS、Email、OAuth 等

```typescript
import { getSystemKey } from '@/server/keys.service';
const awsKey = await getSystemKey('AWS_ACCESS_KEY');
```

---

## 服務

透過 `/dev-center/settings` 或 env：
- **S3**：Access Key、Secret、Region、Bucket
- **Email**：Resend API Key、From Address
- **AI**：OpenAI API Key

---

## 檔案上傳

`lib/upload-router.ts`：
```typescript
export const ourFileRouter = {
  general: { maxSize: "200MB" },
  editor: { maxSize: "500MB", accept: ["image/*", "video/*"] },
  logo: { maxSize: "3MB", accept: ["image/*"] }
}
```

---

## 國際化

`i18n/config.ts`：
```typescript
export const locales = ["en", "zh-TW"] as const;
```

翻譯：`modules/[name]/_messages/[locale].json`

---

## 中介層

`proxy.ts` 保護所有路由，除了：
- `/api/*`
- `/login`、`/signup`、`/auth/*`
- 公開資源

---

## 正式環境檢查清單

```env
NODE_ENV=production
DATABASE_URL=postgresql://...?sslmode=require
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=strong-random-secret
```

- [ ] 強 NEXTAUTH_SECRET（`openssl rand -base64 32`）
- [ ] SSL 資料庫
- [ ] S3 已設定
- [ ] Email 服務已設定
- [ ] 更新 `config/index.ts` 正式環境值
