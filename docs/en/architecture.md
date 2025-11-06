# Architecture

## Overview

**NBEE** (Next Base Enterprise Engine) is an enterprise middleware framework that enables modular system construction through:
- **Core-BEE**: Foundation framework with routing, auth, and extension points
- **Feature Modules**: Self-contained, portable business logic units

## Principles

**Low-coupling architecture** via interface contracts, enabling cross-project reuse and evolution.

**Core Rules**:
- Interact via public APIs only—no cross-module imports or shared state
- Avoid framework lock-in and global dependencies
- Modules mount at extension points (slots) and can be hot-swapped
- Semantic versioning for stable APIs

## 4-Layer Architecture

**App → Modules → Components → Libraries**

### App Layer
Routes, layouts, and global configuration.

```
app/
├── (auth)/       # Auth routes (grouped, no URL pollution)
├── (www)/        # Public routes  
├── account/      # User management
├── dashboard/    # Main workspace
├── dev-center/   # Developer admin
└── api/          # API endpoints
```

### Modules Layer
Self-contained business features with Server Actions.

```
modules/[feature]/
├── _server/
│   ├── actions.ts    # Mutations
│   └── queries.ts    # Data fetching
├── _components/      # Feature UI
├── _messages/        # i18n (en.json, zh-TW.json)
└── tests/            # Contract tests
```

**Import Rules**:
- ✅ `@/lib/*` and `@/components/*`
- ❌ `@/modules/other-feature/*` (causes coupling)

**Examples**: `modules/account/`, `modules/auth/`, `modules/dev-center/`

### Components Layer
Reusable UI (shadcn/ui based).

```
components/
├── ui/           # Button, Card, Dialog...
├── primitives/   # Custom components
├── permission/   # RBAC wrappers
└── editor/       # Plate.js editor
```

### Libraries Layer
Pure utilities and integrations—no business logic.

```
lib/
├── db/              # Drizzle ORM + schemas
├── s3/              # File storage
├── email/           # Resend
├── permissions.ts   # RBAC definitions
└── utils/           # Helpers
```

---

## Interface Contracts

### Server Action Pattern
```typescript
'use server';

type ActionResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string };

export async function createResource(input: TInput): Promise<ActionResult<TResource>> {
  // Implementation
}
```

### Permission Pattern
```typescript
// lib/permissions.ts
export const permissions = {
  'users.read': 'View users',
  'users.write': 'Create/edit users',
};

// Usage in components
<ProtectedArea resource="users" action="read">
  {/* Content */}
</ProtectedArea>
```

---

## Module Portability

**Migration Steps**:
1. Copy `modules/[feature]/` to target project
2. Verify `lib/` dependencies exist
3. Merge i18n files
4. Run tests

**Modules work identically across projects** due to zero global dependencies.

---

## Extension Points (Slots)

Modules extend Core-BEE via:
- **API Routes**: `app/api/[[...slugs]]/route.ts` (Elysia.js)
- **Auth Hooks**: `app/(auth)/auth.config.ts`
- **Permission Checks**: `<ProtectedArea>` component
- **Upload Routes**: `lib/upload-router.ts`
- **Menu Items**: Managed via Dev Center

---

## Best Practices

### Module Development
```
modules/[feature]/
├── _server/         # Server Actions only
├── _components/     # Feature-specific UI
├── _messages/       # i18n
└── tests/           # Contract tests for public APIs
```

### Testing
Test **public APIs**, not implementation:
```typescript
describe('createUser', () => {
  it('returns success with valid data', async () => {
    const result = await createUser(validData);
    expect(result.success).toBe(true);
  });
});
```

### Versioning
- **Major**: Breaking API changes
- **Minor**: New features (backward compatible)
- **Patch**: Bug fixes

### CI/CD Checks
- Unit/integration tests
- Type checking (`tsc --noEmit`)
- Linting (`biome check`)
- Build success

---

## DO ✅ / DON'T ❌

✅ Use Server Actions for mutations  
✅ Keep modules self-contained  
✅ Write contract tests  
✅ Follow directory conventions  

❌ Cross-module imports  
❌ Global state sharing  
❌ Hard-code configuration  
❌ Skip testing public APIs  

---

## Summary

Core-BEE provides:
- **Modularity**: Clear feature boundaries
- **Portability**: Modules work across projects
- **Extensibility**: Slot-based plugins
- **Testability**: Contract-based testing
