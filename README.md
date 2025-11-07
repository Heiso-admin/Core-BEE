# Core-BEE

Production-ready admin dashboard built with Next.js 16, featuring authentication, RBAC permissions and modular architecture.

> **Note**: Customize branding in `config/index.ts`.

## Features

- NextAuth v5 with 2FA
- Resource-based RBAC permissions
- PostgreSQL + Drizzle ORM
- Multi-language (en, zh-TW)
- S3 file uploads
- Radix + Tailwind v4 + Shadcn UI
- React Email + Resend

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

- **[Setup Guide](docs/setup-guide.md)** - Complete installation walkthrough
- **[Quick Reference](docs/quick-reference.md)** - Commands & code snippets
- **[Project Structure](docs/project-structure.md)** - Architecture overview
- **[Configuration](docs/configuration.md)** - Customize your app

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
modules/          # Feature modules
lib/db/schema/    # Database schemas
server/services/  # Business logic
components/       # React components
```

Please refer to docs [Project Structure](docs/project-structure.md)


