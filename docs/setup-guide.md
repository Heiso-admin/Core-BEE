# Setup Guide

## Install

```bash
git clone https://github.com/Heiso-admin/Core-BEE.git
cd Core-BEE
pnpm install
```

## Environment

Create `.env.local`:

```env
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
NEXTAUTH_SECRET=your-secret-32-chars  # openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000
OPENAI_API_KEY=sk-xxx  # Optional
```

## Database

```bash
pnpm db:push  # Apply schema
pnpm dev      # Start server
```

## First User

1. Visit `http://localhost:3000/signup`
2. Create account
3. Login

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

## Configure

**Access Levels**:
- Developer: Full access (in `developers` table)
- Owner: Org admin (`members.isOwner = true`)
- Member: Role-based permissions

**Via `/dev-center`**:
- Create roles & permissions
- Configure menus
- Add AWS S3 credentials
- Add Resend email key
- Customize `config/index.ts` for branding

