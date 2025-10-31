# Project Structure

## Overview

Core-BEE follows a modular Next.js architecture with clear separation between routes, business logic, and shared resources. The structure emphasizes convention over configuration and promotes code reusability.

## Directory Structure

### `/app` - Next.js App Router

```
app/
├── (auth)/              # Authentication routes (grouped layout)
│   ├── login/
│   ├── signup/
│   ├── role-select/
│   └── auth.config.ts
├── (www)/               # Public routes
├── account/             # User account management
│   ├── me/
│   ├── 2fa/
│   └── authentication/
├── dashboard/           # Main application workspace
│   ├── (dashboard)/
│   └── (member)/
├── dev-center/          # Developer administration panel
│   ├── (menu)/
│   ├── (permission)/
│   ├── (system)/
│   └── developers/
├── api/                 # API routes
│   ├── [[...slugs]]/   # Elysia.js API handler
│   └── ai/             # AI endpoints
├── layout.tsx          # Root layout
├── ClientBody.tsx      # Client-side body wrapper
└── globals.css         # Global styles
```

**Route groups** (folders in parentheses) organize related routes without affecting the URL structure.

### `/modules` - Feature Modules

Domain-specific feature implementations following a consistent structure:

```
modules/
├── account/
├── auth/
└── dev-center/
    ├── _components/     # Module-specific components
    ├── _messages/       # i18n files (en.json, zh-TW.json)
    ├── _server/         # Server actions & queries
    ├── layout.tsx
    └── page.tsx
```

Each module is self-contained with its own components, translations, and server logic.

### `/components` - Shared Components

```
components/
├── ui/                  # Shadcn/ui components
├── primitives/          # Custom reusable components
│   ├── action-button.tsx
│   ├── avatar.tsx
│   ├── dashboard-sidebar.tsx
│   └── ...
├── permission/          # RBAC components
│   ├── protected-area.tsx
│   └── protected-button.tsx
├── editor/              # Rich text editor (Plate.js)
│   ├── plate-editor.tsx
│   ├── editor-kit.tsx
│   ├── use-chat.ts
│   └── plugins/
├── skeleton/            # Loading skeletons
└── hooks/               # Shared React hooks
```

### `/lib` - Core Libraries

```
lib/
├── db/
│   ├── index.ts         # Database client
│   └── schema/          # Drizzle ORM schemas
├── s3/                  # AWS S3 integration
├── email/               # Email service
├── hash/                # Password hashing utilities
├── tree/                # Tree data structure helpers
├── utils/               # Shared utilities
├── permissions.ts       # RBAC definitions
├── upload-router.ts     # File upload configuration
├── id-generator.ts      # ID generation (cuid2)
└── format.ts            # Formatting utilities
```

### `/server` - Business Logic

```
server/
├── services/            # Feature-specific services
├── file.service.ts      # File management
├── site.service.ts      # Site configuration
├── user.service.ts      # User operations
└── locale.ts            # Localization utilities
```

Centralized business logic layer that abstracts database operations and external services.

### `/providers` - React Context Providers

```
providers/
├── account.tsx          # User account state
├── permission.tsx       # Permission context
└── site.tsx             # Site configuration
```

### `/config` - Configuration

```
config/
├── index.ts             # Site configuration
└── settings.ts          # Application settings
```

### `/i18n` - Internationalization

```
i18n/
├── config.ts            # i18n configuration
└── request.ts           # Server-side i18n utilities
```

Supports English and Traditional Chinese (zh-TW).

### `/emails` - Email Templates

```
emails/
├── 2fa.tsx
├── forgot-password.tsx
├── invite-user.tsx
├── verify-account.tsx
└── static/              # Email assets
```

React Email templates for transactional emails.

### `/drizzle` - Database Migrations

```
drizzle/
├── 0000_*.sql
├── 0001_*.sql
└── meta/                # Migration metadata
```

Generated SQL migrations managed by Drizzle Kit.

### `/types` - TypeScript Definitions

```
types/
├── client.d.ts          # Client-side types
├── permission.d.ts      # Permission types
└── system.d.ts          # System-level types
```

### `/hooks` - Global React Hooks

```
hooks/
├── use-debounce.ts
├── use-mobile.ts
├── use-permission.ts
├── use-upload-file.ts
└── use-upload-s3-file.ts
```

### Root Configuration Files

```
├── biome.json           # Linter & formatter config
├── components.json      # Shadcn/ui config
├── drizzle.config.ts    # Database config
├── next.config.ts       # Next.js config
├── tsconfig.json        # TypeScript config
├── postcss.config.mjs   # PostCSS config
├── proxy.ts             # Authentication middleware
└── package.json         # Dependencies & scripts
```

## Conventions

### Import Aliases

All imports use the `@/*` alias mapping to the root directory:

```tsx
import { db } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { UserService } from '@/server/user.service';
```

### Module Structure Pattern

Each feature module follows this template:

```
modules/my-feature/
├── _components/         # Feature-specific components
│   └── my-component.tsx
├── _messages/           # Translations
│   ├── en.json
│   └── zh-TW.json
├── _server/            # Server actions
│   └── actions.ts
├── layout.tsx          # Nested layout (optional)
└── page.tsx            # Route entry point
```

### Database Schema Pattern

Drizzle schemas export consistent types:

```typescript
// lib/db/schema/users.ts
export const users = pgTable('users', { /* ... */ });
export const userSchema = createSelectSchema(users);
export type TUser = z.infer<typeof userSchema>;
```

### Component Naming

- **UI components**: `<Button>`, `<Card>`, `<Dialog>`
- **Primitives**: `<ActionButton>`, `<DashboardSidebar>`
- **Permission wrappers**: `<ProtectedArea>`, `<ProtectedButton>`

### Server Actions

Located in module `_server/` directories, prefixed with action type:

```typescript
'use server';

export async function createUser(data: TUser) { /* ... */ }
export async function updateUser(id: string, data: Partial<TUser>) { /* ... */ }
export async function deleteUser(id: string) { /* ... */ }
```

## Key Patterns

### Permission-Based Rendering

```tsx
import { ProtectedArea } from '@/components/permission/protected-area';

<ProtectedArea permissions={['admin.write']}>
  <AdminPanel />
</ProtectedArea>
```

### File Uploads

```tsx
import { useUploadS3File } from '@/hooks/use-upload-s3-file';

const { upload } = useUploadS3File();
const url = await upload(file);
```

### Internationalization

```tsx
import { useTranslations } from 'next-intl';

const t = useTranslations('account');
return <h1>{t('title')}</h1>;
```

