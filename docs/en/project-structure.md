# Project Structure

## Overview

Core-BEE follows a **4-layer modular architecture**: **App → Modules → Components → Libraries**

- **Convention over configuration**
- **Cross-project module portability**
- **Clear separation of concerns**

> See [Architecture](architecture.md) for detailed layer responsibilities.

---

## Directory Structure

### `/app` - Routes & Layouts

```
app/
├── (auth)/              # Auth routes (grouped, no URL impact)
│   ├── login/
│   ├── signup/
│   └── auth.config.ts
├── (www)/               # Public routes
├── account/             # User management
├── dashboard/           # Main workspace
├── dev-center/          # Developer admin
├── api/
│   ├── [[...slugs]]/   # Elysia.js API
│   └── ai/
├── layout.tsx
├── ClientBody.tsx
└── globals.css
```

**Route groups** (parentheses) organize routes without affecting URLs.

---

### `/modules` - Feature Modules

Self-contained features with consistent structure:

```
modules/[feature]/
├── _server/
│   ├── actions.ts       # Mutations
│   └── queries.ts       # Data fetching
├── _components/         # Feature UI
├── _messages/           # i18n (en.json, zh-TW.json)
├── tests/
├── layout.tsx           # Optional
└── page.tsx
```

**Import Rules**:
- ✅ `@/lib/*`, `@/components/*`, `@/server/services/*`
- ❌ `@/modules/other-feature/*` (causes coupling)

**Migration**: Copy folder → verify deps → merge i18n → test

> See [Architecture - Module Portability](architecture.md#module-portability)

**Examples**: `modules/account/`, `modules/auth/`, `modules/dev-center/`

---

### `/components` - Shared UI

```
components/
├── ui/                  # Shadcn/ui (Button, Card, Dialog...)
├── primitives/          # Custom components
├── permission/          # RBAC wrappers
├── skeleton/
└── hooks/
```

---

### `/lib` - Core Libraries

```
lib/
├── db/
│   ├── index.ts         # Drizzle client
│   └── schema/
├── s3/
├── email/
├── hash/
├── utils/
├── permissions.ts       # RBAC definitions
├── upload-router.ts
├── id-generator.ts
└── format.ts
```

**Zero business logic** - pure utilities only.

---

### `/server` - Business Logic

```
server/
├── services/
├── file.service.ts
├── site.service.ts
├── user.service.ts
└── locale.ts
```

Abstracts database operations and external services.

---

### Other Directories

**`/providers`**: React context (account, permission, site)  
**`/config`**: Site configuration  
**`/i18n`**: Internationalization (en, zh-TW)  
**`/emails`**: React Email templates  
**`/drizzle`**: Database migrations  
**`/types`**: TypeScript definitions  
**`/hooks`**: Global React hooks  

---

## Conventions

### Import Aliases
```tsx
import { db } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { UserService } from '@/server/user.service';
```

### Database Schema
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
  // Implementation
}
```

### Component Naming
- UI: `<Button>`, `<Card>`, `<Dialog>`
- Primitives: `<ActionButton>`, `<DashboardSidebar>`
- Permission: `<ProtectedArea>`, `<ProtectedButton>`

---

## Key Patterns

### Extension Points (Slots)
- **API Routes**: `app/api/[[...slugs]]/` (Elysia.js)
- **Auth**: `auth.config.ts`
- **Permissions**: `lib/permissions.ts`
- **Uploads**: `lib/upload-router.ts`
- **Menu**: Via Dev Center

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

