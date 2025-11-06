# 專案結構

## 概述

Core-BEE 遵循**四層模組化架構**：**App → Modules → Components → Libraries**

- **慣例優於配置**
- **跨專案模組可移植性**
- **清晰的關注點分離**

> 參見[架構](architecture.md)以獲得詳細的層級職責。

---

## 目錄結構

### `/app` - 路由與 Layouts

```
app/
├── (auth)/              # 認證路由（分組，不影響 URL）
│   ├── login/
│   ├── signup/
│   └── auth.config.ts
├── (www)/               # 公開路由
├── account/             # 使用者管理
├── dashboard/           # 主要工作區
├── dev-center/          # 開發者管理
├── api/
│   ├── [[...slugs]]/   # Elysia.js API
│   └── ai/
├── layout.tsx
├── ClientBody.tsx
└── globals.css
```

**路由分組**（括號）組織路由而不影響 URL。

---

### `/modules` - 功能模組

具有一致結構的自包含功能：

```
modules/[feature]/
├── _server/
│   ├── actions.ts       # 變更操作
│   └── queries.ts       # 資料獲取
├── _components/         # 功能 UI
├── _messages/           # i18n（en.json, zh-TW.json）
├── tests/
├── layout.tsx           # 選用
└── page.tsx
```

**匯入規則**：
- ✅ `@/lib/*`、`@/components/*`、`@/server/services/*`
- ❌ `@/modules/other-feature/*`（產生耦合）

**遷移**：複製資料夾 → 驗證依賴 → 合併 i18n → 測試

> 參見[架構 - 模組可移植性](architecture.md#模組可移植性)

**範例**：`modules/account/`、`modules/auth/`、`modules/dev-center/`

---

### `/components` - 共用 UI

```
components/
├── ui/                  # Shadcn/ui（Button、Card、Dialog...）
├── primitives/          # 自訂元件
├── permission/          # RBAC 包裝器
├── editor/              # Plate.js 編輯器
├── skeleton/
└── hooks/
```

---

### `/lib` - 核心函式庫

```
lib/
├── db/
│   ├── index.ts         # Drizzle 客戶端
│   └── schema/
├── s3/
├── email/
├── hash/
├── utils/
├── permissions.ts       # RBAC 定義
├── upload-router.ts
├── id-generator.ts
└── format.ts
```

**零業務邏輯** - 僅純工具。

---

### `/server` - 業務邏輯

```
server/
├── services/
├── file.service.ts
├── site.service.ts
├── user.service.ts
└── locale.ts
```

抽象化資料庫操作與外部服務。

---

### 其他目錄

**`/providers`**：React context（account、permission、site）  
**`/config`**：網站配置  
**`/i18n`**：國際化（en、zh-TW）  
**`/emails`**：React Email 範本  
**`/drizzle`**：資料庫遷移  
**`/types`**：TypeScript 定義  
**`/hooks`**：全域 React hooks  

---

## 慣例

### 匯入別名
```tsx
import { db } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { UserService } from '@/server/user.service';
```

### 資料庫 Schema
```typescript
// lib/db/schema/users.ts
export const users = pgTable('users', { /* ... */ });
export const userSchema = createSelectSchema(users);
export type TUser = z.infer<typeof userSchema>;
```

### Server Actions
```typescript
'use server';

type ActionResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string };

export async function createUser(data: TUser): Promise<ActionResult<TUser>> {
  // 實作
}
```

### 元件命名
- UI：`<Button>`、`<Card>`、`<Dialog>`
- Primitives：`<ActionButton>`、`<DashboardSidebar>`
- Permission：`<ProtectedArea>`、`<ProtectedButton>`

---

## 關鍵模式

### 擴充點（Slots）
- **API 路由**：`app/api/[[...slugs]]/`（Elysia.js）
- **認證**：`auth.config.ts`
- **權限**：`lib/permissions.ts`
- **上傳**：`lib/upload-router.ts`
- **選單**：透過 Dev Center

### 基於權限的渲染
```tsx
import { ProtectedArea } from '@/components/permission/protected-area';

<ProtectedArea permissions={['admin.write']}>
  <AdminPanel />
</ProtectedArea>
```

### 檔案上傳
```tsx
import { useUploadS3File } from '@/hooks/use-upload-s3-file';

const { upload } = useUploadS3File();
const url = await upload(file);
```

### 國際化
```tsx
import { useTranslations } from 'next-intl';

const t = useTranslations('account');
return <h1>{t('title')}</h1>;
```
