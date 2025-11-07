# Core-BEE Documentation

---

## 📖 English Documentation

Comprehensive guides for Core-BEE enterprise platform:

- **[Architecture](en/architecture.md)** - NBEE concept, 4-layer architecture, module portability
- **[Setup Guide](en/setup-guide.md)** - Installation, database setup, Dev Center access
- **[Project Structure](en/project-structure.md)** - Directory organization, conventions, patterns
- **[Configuration](en/configuration.md)** - Environment variables, services, Dev Center settings
- **[Quick Reference](en/quick-reference.md)** - Commands, code snippets, URLs

### Quick Links
- [What is NBEE?](en/architecture.md#nbee-overview)
- [Getting Started](en/setup-guide.md)
- [Dev Center Guide](en/setup-guide.md#dev-center)
- [API Keys Management](en/setup-guide.md#api-keys-management)
- [Module Portability](en/architecture.md#module-portability)

---

## 📖 繁體中文文件

Core-BEE 企業平台完整指南：

- **[架構](zh-TW/architecture.md)** - NBEE 概念、四層架構、模組可移植性
- **[設定指南](zh-TW/setup-guide.md)** - 安裝、資料庫設定、Dev Center 存取
- **[專案結構](zh-TW/project-structure.md)** - 目錄組織、慣例、模式
- **[設定](zh-TW/configuration.md)** - 環境變數、服務、Dev Center 設定
- **[快速參考](zh-TW/quick-reference.md)** - 指令、程式碼片段、網址

### 快速連結
- [什麼是 NBEE？](zh-TW/architecture.md#nbee-概述)
- [快速開始](zh-TW/setup-guide.md)
- [Dev Center 指南](zh-TW/setup-guide.md#dev-center)
- [API Keys 管理](zh-TW/setup-guide.md#api-keys-管理)
- [模組可移植性](zh-TW/architecture.md#模組可移植性)

---

## 🚀 Getting Started / 快速開始

### Installation / 安裝

```bash
git clone https://github.com/Heiso-admin/Core-BEE.git
cd Core-BEE
pnpm install
```

### Setup / 設定

```bash
# Create .env.local / 建立 .env.local
# DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL

pnpm db:push  # Apply schema / 套用 schema
pnpm dev      # Start server / 啟動伺服器
```

### First Steps / 第一步

1. Visit / 造訪: `http://localhost:3000/signup`
2. Create account / 建立帳號
3. Add to `developers` table / 新增至 `developers` 資料表
4. Access Dev Center / 存取 Dev Center: `/dev-center`

---

## 🏗️ Architecture Overview / 架構概覽

**4-Layer Modular Architecture / 四層模組化架構**:

```
┌─────────────────────────────────────┐
│  App Layer / App 層                 │  Routes, layouts, auth
│  應用入口與組織                      │  路由、layouts、認證
├─────────────────────────────────────┤
│  Modules Layer / Modules 層         │  Business logic, APIs
│  業務模組與 API 封裝                 │  業務邏輯、APIs
├─────────────────────────────────────┤
│  Components Layer / Components 層   │  Shared UI, hooks
│  共用 UI 元件與區塊                  │  共用 UI、hooks
├─────────────────────────────────────┤
│  Libraries Layer / Libraries 層     │  Database, utils, services
│  工具與第三方整合                    │  資料庫、工具、服務
└─────────────────────────────────────┘
```

---

## 🔑 Key Features / 核心功能

- ✅ **Modular / 模組化** - Clear boundaries between features / 功能間邊界清晰
- ✅ **Portable / 可移植** - Modules work across projects / 模組可跨專案使用
- ✅ **Extensible / 可擴展** - Slot-based plugin architecture / 基於 slot 的插件架構
- ✅ **RBAC / 權限** - Resource-based access control / 基於資源的存取控制
- ✅ **i18n / 國際化** - English & Traditional Chinese / 英文與繁體中文
- ✅ **Dev Center / 開發者中心** - Comprehensive admin panel / 全面的管理面板

---

## 📚 Additional Resources / 其他資源

- [GitHub Repository](https://github.com/Heiso-admin/Core-BEE)
- [Report Issues / 回報問題](https://github.com/Heiso-admin/Core-BEE/issues)
- [Contribute / 貢獻](https://github.com/Heiso-admin/Core-BEE/blob/main/CONTRIBUTING.md)

---

## 📝 License / 授權

MIT License - See [LICENSE](../LICENSE) for details
