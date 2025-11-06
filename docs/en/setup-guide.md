# Setup Guide

## Install

```bash
git clone https://github.com/Heiso-admin/Core-BEE.git
cd Core-BEE
pnpm install
```

---

## Environment

Create `.env.local`:

```env
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
NEXTAUTH_SECRET=your-secret-32-chars  # openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000
OPENAI_API_KEY=sk-xxx  # Optional
```

---

## Database

```bash
pnpm db:push  # Apply schema
pnpm dev      # Start server
```

---

## First User

1. Visit `http://localhost:3000/signup`
2. Create account
3. Login

---

## Developer Access

**Required** to access `/dev-center`:

```bash
pnpm db:studio  # Open at localhost:4983
```

1. Go to `developers` table
2. Add record with your `userId` from `users` table
3. **Logout and login** (required!)
4. Access `/dev-center`

**Troubleshooting**: Clear cookies and login again if still seeing "Only admin can access".

---

## Access Levels

- **Developer**: Full access (in `developers` table)
- **Owner**: Org admin (`members.isOwner = true`)
- **Member**: Role-based permissions

---

## Dev Center Configuration

Via `/dev-center`:

**Permissions & Roles**:
- Define resources (`users`, `reports`, etc.)
- Set actions (`read`, `write`, `delete`)
- Create role templates
- Assign to teams/members

**API Keys**:
1. Create: Name + Scopes + Expiration
2. Use: `Authorization: Bearer <key>`
3. Rotate: Auto or manual
4. Revoke: Immediate invalidation

**Security**:
- ✅ Store in secrets manager
- ✅ Minimal scopes (least privilege)
- ✅ Rotate every 90 days
- ❌ Never commit to code

**Services**:
- AWS S3 credentials
- Resend email key
- OpenAI API key

**Customization**:
- Menu structure & visibility
- `config/index.ts` for branding

---

## Quick Workflow

1. **Define resource**: Dev Center → Permissions
2. **Create role**: Dev Center → Roles
3. **Issue API key**: Dev Center → API Keys
4. **Test**: Dev Center → API Docs
5. **Deploy**: Store key in secrets manager

---

## Troubleshooting

**"Only admin can access"**:
1. Verify `userId` in `developers` table
2. **Logout and login** (required)
3. Clear cookies
4. Restart server

**API key not working**:
1. Check expiration
2. Verify scopes match endpoint
3. Ensure correct header format
4. Confirm key not revoked

