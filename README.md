# Core-BEE

> **[English](#english)** | **[繁體中文](#繁體中文)**

---

## English

Production-ready admin dashboard built with Next.js 16, featuring authentication, RBAC permissions and modular architecture.

> **Note**: Customize branding in `config/index.ts`.

## What is NBEE?

**NBEE** = **Next Base Enterprise Engine**

An enterprise-grade middleware architecture designed to help teams build systems rapidly like "assembling LEGO blocks." It consists of **Core-BEE** (core engine) + feature packages (mini apps), enabling enterprises to freely select, assemble, and replace capabilities.

**Core Philosophy**:
- **Clear Boundaries**: Interact only through public APIs, events, and data models
- **Portability**: Avoid framework lock-in; enable cross-project reuse
- **Extensibility**: Slot-based architecture for hot-swappable modules
- **Consistency**: Standardized tooling, configuration, and deployment

**Design Goals**: Reduce costs, increase reusability, fast iteration, easy replacement, clear boundaries, and stable versioning.

## Architecture

Core-BEE follows a 4-layer modular architecture:

- **App Layer**: Application entry point and routing (Next.js App Router)
- **Modules Layer**: Self-contained business modules with API encapsulation
- **Components Layer**: Shared UI components and blocks (shadcn/ui)
- **Libraries Layer**: Tools and third-party integrations (ORM, AWS SDK, Utils)

Each module is **portable** and can be moved across projects with minimal effort. See [Architecture Guide](docs/architecture.md) for details.

## Features

- NextAuth v5 with 2FA
- Resource-based RBAC permissions
- PostgreSQL + Drizzle ORM
- Multi-language (en, zh-TW)
- S3 file uploads
- Radix + Tailwind v4 + Shadcn UI
- React Email + Resend
- Dev Center for developer administration

## Quick Start

```bash
git clone https://github.com/Heiso-admin/Core-BEE.git
cd Core-BEE
pnpm install
```

**Setup database**:
```bash
# Create .env.local with DATABASE_URL and NEXTAUTH_SECRET
pnpm db:push
pnpm dev
```

Visit `http://localhost:3000/signup` to create an account.

> ⚠️ **Important**: After signup, add yourself to the `developers` table to access `/dev-center`.

## Documentation

> 📖 **[Docs Index](docs/README.md)**

- **[Architecture](docs/en/architecture.md)** - NBEE concept, layers, and module portability
- **[Setup Guide](docs/en/setup-guide.md)** - Complete installation walkthrough
- **[Project Structure](docs/en/project-structure.md)** - Directory organization
- **[Configuration](docs/en/configuration.md)** - Customize your app
- **[Quick Reference](docs/en/quick-reference.md)** - Commands & code snippets

## Tech Stack

**Core**: Next.js 16, React 19, TypeScript 5  
**Database**: PostgreSQL, Drizzle ORM  
**Auth**: NextAuth 5.0  
**UI**: Tailwind v4, Radix UI, Shadcn UI  
**Tools**: Biome, pnpm, dotenv-flow


## Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm db:push      # Apply database schema
pnpm db:studio    # Open database UI
pnpm lint         # Check code
pnpm format       # Format code
```

## Project Structure

```
app/              # Next.js routes
modules/          # Feature modules (portable, self-contained)
lib/db/schema/    # Database schemas
server/services/  # Business logic
components/       # React components
```

Please refer to docs [Project Structure](docs/project-structure.md) and [Architecture](docs/architecture.md)

## Dev Center

Access at `/dev-center` (requires developer role).

**Core Capabilities**:
- **Team Management**: Organize members and resource boundaries
- **Role Templates**: Reusable permission sets for teams/members
- **O365 Integration**: SSO and user/group synchronization
- **Developers**: Manage developer roster, roles, and permissions
- **Menu Management**: Control system menu structure and visibility
- **Permission System**: Resource-based authorization (operations/scopes)
- **API Keys**: Issue, rotate, revoke API keys with scope control
- **API Documentation**: Browse and test APIs (OpenAPI-based)
- **Keys Management**: Centralized secrets and third-party credentials

**API Keys Workflow**:
1. Define resources and operations in Permission system
2. Create role templates with appropriate permissions
3. Issue API key with specific scopes and expiration
4. Validate API calls in API Documentation
5. Include `Authorization: Bearer <api_key>` header in requests
6. Rotate or revoke keys as needed

> ⚠️ **Security**: API keys are shown only once at creation. Store securely (e.g., Secrets Manager).

**Quick Start**: After signup, add your `userId` to the `developers` table to access Dev Center.


---

## 繁體中文

基於 Next.js 16 打造的企業級管理後台，具備認證、RBAC 權限、富文字編輯與模組化架構。

> **注意**：可在 `config/index.ts` 自訂品牌設定。

### 什麼是 NBEE？

**NBEE** = **Next Base Enterprise Engine**（次世代企業基礎引擎）

一個專為企業設計的中台架構，幫助團隊像「組樂高」一樣快速構建系統。由 **Core-BEE**（核心引擎）+ 功能套件（mini apps）組成，讓企業能自由選擇、組裝、替換所需能力。

**核心理念**：
- **邊界清楚**：僅以公開 API、事件和資料模型互動
- **易移植**：避免框架鎖定；支援跨專案復用
- **可擴展**：基於 slot 的熱插拔模組架構
- **一致性**：標準化工具、配置與部署

**設計目標**：降成本、提復用、快迭代、易替換、邊界清晰、版本穩定。

### 架構

Core-BEE 遵循四層模組化架構：

- **App 層**：應用入口與路由（Next.js App Router）
- **Modules 層**：自包含的業務模組與 API 封裝
- **Components 層**：共用 UI 元件與區塊（shadcn/ui）
- **Libraries 層**：工具與第三方整合（ORM、AWS SDK、Utils）

每個模組都是**可移植的**，可以最小努力在專案間移動。詳見[架構指南](docs/zh-TW/architecture.md)。

### 功能

- NextAuth v5 雙重驗證（2FA）
- 基於資源的 RBAC 權限
- Plate.js 編輯器與 AI
- PostgreSQL + Drizzle ORM
- 多語系（en、zh-TW）
- S3 檔案上傳
- Radix + Tailwind v4 + Shadcn UI
- React Email + Resend
- 開發者管理中心（Dev Center）

### 快速開始

```bash
git clone https://github.com/Heiso-admin/Core-BEE.git
cd Core-BEE
pnpm install
```

**設定資料庫**：
```bash
# 建立 .env.local，包含 DATABASE_URL 與 NEXTAUTH_SECRET
pnpm db:push
pnpm dev
```

造訪 `http://localhost:3000/signup` 建立帳號。

> ⚠️ **重要**：註冊後，將自己加入 `developers` 資料表以存取 `/dev-center`。

### 文件

> 📖 **[文件索引](docs/README.md)**

- **[架構](docs/zh-TW/architecture.md)** - NBEE 概念、層級與模組可移植性
- **[設定指南](docs/zh-TW/setup-guide.md)** - 完整安裝步驟
- **[專案結構](docs/zh-TW/project-structure.md)** - 目錄組織
- **[設定](docs/zh-TW/configuration.md)** - 自訂您的應用程式
- **[快速參考](docs/zh-TW/quick-reference.md)** - 指令與程式碼片段

### 技術棧

**核心**：Next.js 16、React 19、TypeScript 5  
**資料庫**：PostgreSQL、Drizzle ORM  
**認證**：NextAuth 5.0  
**介面**：Tailwind v4、Radix UI、Shadcn UI  
**編輯器**：Plate.js 49、AI SDK  
**工具**：Biome、pnpm、dotenv-flow

### 指令

```bash
pnpm dev          # 啟動開發伺服器
pnpm build        # 正式版建置
pnpm db:push      # 套用資料庫 schema
pnpm db:studio    # 開啟資料庫 UI
pnpm lint         # 檢查程式碼
pnpm format       # 格式化程式碼
```

### 專案結構

```
app/              # Next.js 路由
modules/          # 功能模組（可移植、自包含）
lib/db/schema/    # 資料庫 schemas
server/services/  # 業務邏輯
components/       # React 元件
```

請參閱文件[專案結構](docs/zh-TW/project-structure.md)與[架構](docs/zh-TW/architecture.md)

### Dev Center

於 `/dev-center` 存取（需要開發者角色）。

**核心能力**：
- **團隊管理**：組織成員與資源邊界
- **角色範本**：可重用的權限集合（團隊/成員）
- **O365 整合**：SSO 與使用者/群組同步
- **開發者**：管理開發者名單、角色與權限
- **選單管理**：控制系統選單結構與可見性
- **權限系統**：基於資源的授權（操作/範圍）
- **API Keys**：發行、輪替、撤銷具範圍控制的 API 金鑰
- **API 文件**：瀏覽與測試 APIs（基於 OpenAPI）
- **Keys 管理**：集中管理機密與第三方憑證

**API Keys 工作流程**：
1. 在權限系統定義資源與操作
2. 建立具適當權限的角色範本
3. 發行具特定範圍與到期時間的 API 金鑰
4. 在 API 文件中驗證 API 呼叫
5. 在請求中包含 `Authorization: Bearer <api_key>` 標頭
6. 視需要輪替或撤銷金鑰

> ⚠️ **安全**：API 金鑰僅在建立時顯示一次。請安全儲存（例如 Secrets Manager）。

**快速開始**：註冊後，將您的 `userId` 加入 `developers` 資料表以存取 Dev Center。

