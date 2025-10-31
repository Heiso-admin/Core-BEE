# Configuration

## Site

Edit `config/index.ts`:

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

## Environment

```env
# Required
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
NEXTAUTH_SECRET=your-secret  # openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000

# Optional
OPENAI_API_KEY=sk-xxx
NEXT_PUBLIC_SITE_ENDPOINT=http://localhost:3000
```

**dotenv-flow**: `.env.local` > `.env.[NODE_ENV]` > `.env`

## Services

Via `/dev-center/settings`:
- AWS S3: Access Key, Secret, Region, Bucket
- Resend: API Key, From Email
- OpenAI: API Key (or via env)

## Upload Routes

`lib/upload-router.ts`:

```typescript
export const ourFileRouter = {
  general: { maxSize: "200MB" },
  editor: { maxSize: "500MB", accept: ["image/*", "video/*"] },
  logo: { maxSize: "3MB", accept: ["image/*"] }
}
```

## i18n

`i18n/config.ts`:

```typescript
export const locales = ["en", "zh-TW"] as const;
```

Add translations in `modules/[name]/_messages/[locale].json`

## Middleware

`proxy.ts` - Protects all routes except:
- `/api/*`
- `/login`, `/signup`, `/auth/*`
- Public assets

## Production

```env
NODE_ENV=production
DATABASE_URL=postgresql://...?sslmode=require
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=strong-secret
```

Checklist:
- [ ] Strong secret
- [ ] SSL database
- [ ] S3 configured
- [ ] Email configured
- [ ] Update `config/index.ts`
