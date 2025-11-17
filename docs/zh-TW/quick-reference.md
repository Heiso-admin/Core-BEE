# 快速參考

## 設定

```bash
pnpm install
pnpm db:push
pnpm dev
```

## 指令

```bash
pnpm dev          # 開發伺服器
pnpm build        # 正式版建置
pnpm db:push      # 套用 schema
pnpm db:studio    # 資料庫 UI (localhost:4983)
pnpm lint         # 檢查程式碼
pnpm format       # 自動格式化
pnpm email:dev    # 預覽 emails
```

## Dev Center

```bash
# 存取網址
http://localhost:3000/dev-center           # 主儀表板
http://localhost:3000/dev-center/menu      # 選單管理
http://localhost:3000/dev-center/permission # 權限
http://localhost:3000/dev-center/api-keys  # API key 管理
http://localhost:3000/api/docs             # API 文件
```

## API Keys

**建立 Key**：
```typescript
// 透過 Dev Center UI 或程式化方式
const apiKey = await createApiKey({
  name: 'Service Name',
  scopes: ['users.read', 'reports.write'],
  expiresAt: new Date('2025-12-31')
});
```

**使用 Key**：
```bash
curl -H "Authorization: Bearer sk_xxx" \
  http://localhost:3000/api/users
```

**輪替 Key**：
```bash
# 透過 Dev Center → API Keys → Rotate 按鈕
# 或程式化方式：
const newKey = await rotateApiKey(keyId);
```

## 權限

```tsx
import { ProtectedArea } from '@/components/permission';

<ProtectedArea resource="users" action="view">
  <UserList />
</ProtectedArea>
```

## 上傳

```tsx
import { useUploadFile } from '@/hooks/use-upload-file';

const { uploadFile } = useUploadFile();
await uploadFile(file, 'general'); // 或 'editor', 'logo'
```

## 國際化

```tsx
import { useTranslations } from 'next-intl';

const t = useTranslations('Namespace');
return <h1>{t('key')}</h1>;
```

## 網址

- 應用程式：http://localhost:3000
- Dev Center：http://localhost:3000/dev-center
- Drizzle Studio：http://localhost:4983
- API 文件：http://localhost:3000/api/docs
