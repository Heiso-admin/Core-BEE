# 架構

## 概述

**NBEE**（Next Base Enterprise Engine，次世代企業基礎引擎）是一個企業中台框架，透過以下組成實現模組化系統建構：
- **Core-BEE**：基礎框架，提供路由、認證與擴充點
- **功能模組**：自包含、可移植的業務邏輯單元

## 原則

**低耦合架構**透過介面約定實現跨專案復用與演進。

**核心規則**：
- 僅透過公開 API 互動—禁止跨模組匯入或共享狀態
- 避免框架鎖定與全域依賴
- 模組掛載於擴充點（slots）並可熱替換
- 語義化版本控制以維持 API 穩定

## 四層架構

**App → Modules → Components → Libraries**

### App 層
路由、layout 與全域配置。

```
app/
├── (auth)/       # 認證路由（分組，不污染 URL）
├── (www)/        # 公開路由
├── account/      # 使用者管理
├── dashboard/    # 主要工作區
├── dev-center/   # 開發者管理
└── api/          # API 端點
```

### Modules 層
自包含的業務功能，使用 Server Actions。

```
modules/[feature]/
├── _server/
│   ├── actions.ts    # 變更操作
│   └── queries.ts    # 資料獲取
├── _components/      # 功能 UI
├── _messages/        # 國際化（en.json, zh-TW.json）
└── tests/            # 契約測試
```

**匯入規則**：
- ✅ `@/lib/*` 與 `@/components/*`
- ❌ `@/modules/other-feature/*`（產生耦合）

**範例**：`modules/account/`、`modules/auth/`、`modules/dev-center/`

### Components 層
可重用 UI（基於 shadcn/ui）。

```
components/
├── ui/           # Button、Card、Dialog...
├── primitives/   # 自訂元件
├── permission/   # RBAC 包裝器
└── editor/       # Plate.js 編輯器
```

### Libraries 層
純工具與整合—無業務邏輯。

```
lib/
├── db/              # Drizzle ORM + schemas
├── s3/              # 檔案儲存
├── email/           # Resend
├── permissions.ts   # RBAC 定義
└── utils/           # 輔助函數
```

---

## 介面約定

### Server Action 模式
```typescript
'use server';

type ActionResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string };

export async function createResource(input: TInput): Promise<ActionResult<TResource>> {
  // 實作
}
```

### 權限模式
```typescript
// lib/permissions.ts
export const permissions = {
  'users.read': '檢視使用者',
  'users.write': '建立/編輯使用者',
};

// 在元件中使用
<ProtectedArea resource="users" action="read">
  {/* 內容 */}
</ProtectedArea>
```

---

## 模組可移植性

**遷移步驟**：
1. 複製 `modules/[feature]/` 到目標專案
2. 驗證 `lib/` 依賴存在
3. 合併 i18n 檔案
4. 執行測試

**模組在不同專案間行為相同**，因為零全域依賴。

---

## 擴充點（Slots）

模組透過以下方式擴展 Core-BEE：
- **API 路由**：`app/api/[[...slugs]]/route.ts`（Elysia.js）
- **認證 Hooks**：`app/(auth)/auth.config.ts`
- **權限檢查**：`<ProtectedArea>` 元件
- **上傳路由**：`lib/upload-router.ts`
- **選單項目**：透過 Dev Center 管理

---

## 最佳實踐

### 模組開發
```
modules/[feature]/
├── _server/         # 僅 Server Actions
├── _components/     # 功能特定 UI
├── _messages/       # i18n
└── tests/           # 公開 API 的契約測試
```

### 測試
測試**公開 API**，非實作細節：
```typescript
describe('createUser', () => {
  it('有效資料應回傳成功', async () => {
    const result = await createUser(validData);
    expect(result.success).toBe(true);
  });
});
```

### 版本控制
- **Major**：API 重大變更
- **Minor**：新功能（向後相容）
- **Patch**：錯誤修復

### CI/CD 檢查
- 單元/整合測試
- 型別檢查（`tsc --noEmit`）
- Linting（`biome check`）
- 建置成功

---

## 應該 ✅ / 不應該 ❌

✅ 使用 Server Actions 處理變更  
✅ 保持模組自包含  
✅ 撰寫契約測試  
✅ 遵循目錄慣例  

❌ 跨模組匯入  
❌ 共享全域狀態  
❌ 硬編碼配置  
❌ 跳過測試公開 API  

---

## 總結

Core-BEE 提供：
- **模組化**：功能間邊界清晰
- **可移植性**：模組可跨專案使用
- **可擴展性**：基於 slot 的插件
- **可測試性**：基於契約的測試
