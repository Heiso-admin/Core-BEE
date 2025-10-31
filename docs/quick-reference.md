# Quick Reference

## Setup

```bash
pnpm install
pnpm db:push
pnpm dev
```

## Commands

```bash
pnpm dev          # Dev server
pnpm build        # Production build
pnpm db:push      # Apply schema
pnpm db:studio    # DB UI (localhost:4983)
pnpm lint         # Check code
pnpm format       # Auto-format
pnpm email:dev    # Preview emails
```



## Permissions

```tsx
import { ProtectedArea } from '@/components/permission';

<ProtectedArea resource="users" action="view">
  <UserList />
</ProtectedArea>
```

## Upload

```tsx
import { useUploadFile } from '@/hooks/use-upload-file';

const { uploadFile } = useUploadFile();
await uploadFile(file, 'general'); // or 'editor', 'logo'
```

## i18n

```tsx
import { useTranslations } from 'next-intl';

const t = useTranslations('Namespace');
return <h1>{t('key')}</h1>;
```

## URLs

- App: http://localhost:3000
- Dev Center: http://localhost:3000/dev-center
- Drizzle Studio: http://localhost:4983
- API Docs: http://localhost:3000/api/docs
