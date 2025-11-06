# Configuration

## Site Config

`config/index.ts`:
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

## Environment Variables

```env
# Required
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
NEXTAUTH_SECRET=your-secret  # openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000

# Optional
OPENAI_API_KEY=sk-xxx
NEXT_PUBLIC_SITE_ENDPOINT=http://localhost:3000
```

**Priority** (dotenv-flow): `.env.local` > `.env.[NODE_ENV]` > `.env`

---

## Dev Center

### Teams & Roles

**Teams**: Dev Center → Teams
- Create team, assign members, set permissions

**Roles**: Dev Center → Roles
- Create reusable permission templates
- Assign to teams or users

### API Keys

Dev Center → API Keys

**Create**: Name + Scopes + Expiration  
**Use**: `Authorization: Bearer <key>`  
**Security**: Store in secrets manager, never in code

**Scopes**:
- Resources: `users`, `reports`, etc.
- Actions: `read`, `write`, `delete`
- Ownership: `own`, `team`, `org`

**Rotation**:
- Auto: Set interval (e.g., 90 days)
- Manual: Via UI
- Grace period during rotation

### Menu

Dev Center → Menu
- Label, icon, route, permissions, parent
- Drag-and-drop reordering
- Visibility rules

### Keys Storage

Store credentials: AWS, Email, OAuth, etc.

```typescript
import { getSystemKey } from '@/server/keys.service';
const awsKey = await getSystemKey('AWS_ACCESS_KEY');
```

---

## Services

Via `/dev-center/settings` or env:
- **S3**: Access Key, Secret, Region, Bucket
- **Email**: Resend API Key, From Address
- **AI**: OpenAI API Key

---

## File Uploads

`lib/upload-router.ts`:
```typescript
export const ourFileRouter = {
  general: { maxSize: "200MB" },
  editor: { maxSize: "500MB", accept: ["image/*", "video/*"] },
  logo: { maxSize: "3MB", accept: ["image/*"] }
}
```

---

## Internationalization

`i18n/config.ts`:
```typescript
export const locales = ["en", "zh-TW"] as const;
```

Translations: `modules/[name]/_messages/[locale].json`

---

## Middleware

`proxy.ts` protects all routes except:
- `/api/*`
- `/login`, `/signup`, `/auth/*`
- Public assets

---

## Production Checklist

```env
NODE_ENV=production
DATABASE_URL=postgresql://...?sslmode=require
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=strong-random-secret
```

- [ ] Strong NEXTAUTH_SECRET (`openssl rand -base64 32`)
- [ ] SSL-enabled database
- [ ] S3 configured
- [ ] Email service configured
- [ ] Update `config/index.ts` with production values
