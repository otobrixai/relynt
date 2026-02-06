# Relynt

**Production-ready AI audit and governance platform for multi-tenant SaaS applications.**

## Overview

Relynt provides auditable, secure, multi-tenant logging and governance for AI-powered SaaS applications. This is a **portfolio-grade** application demonstrating senior-level understanding of:

- **Multi-tenancy**: Strict organization-based data isolation
- **Security boundaries**: Row Level Security (RLS) enforced at the database level
- **Auditability**: Immutable, append-only AI action logs
- **Real-world SaaS patterns**: Production-safe architecture

## Architecture

### Tech Stack

**Frontend:**

- Next.js 16 (App Router)
- TypeScript
- Server Components
- Tailwind CSS

**Backend:**

- Supabase (Postgres + Auth + RLS)
- Supabase Edge Functions (future)

**AI:**

- OpenAI-compatible interface (provider-agnostic)
- Wrapped with logging + guardrails

### Security Model

#### Multi-Tenancy

Every user belongs to one or more **Organizations**. All data is scoped to `organization_id`. The system enforces:

1. **Database-level isolation**: RLS policies prevent cross-organization data access
2. **No client-side filtering**: Security is enforced at the Postgres level
3. **Explicit policies**: Every table has documented RLS policies

#### Row Level Security (RLS)

**Organizations Table:**

```sql
-- Users can only view organizations they are members of
CREATE POLICY "Users can view their organizations"
  ON organizations FOR SELECT
  USING (
    id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid()
    )
  );
```

**AI Audit Logs Table:**

```sql
-- CRITICAL: Users can ONLY view logs from their organizations
CREATE POLICY "Users can only view logs from their organizations"
  ON ai_audit_logs FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

-- Logs are IMMUTABLE - no UPDATE or DELETE policies
```

### Data Model

```
users (Supabase Auth)
  ↓
organization_members
  ├─ organization_id → organizations
  ├─ user_id → users
  └─ role (admin | member)

ai_audit_logs
  ├─ organization_id → organizations
  ├─ actor_id → users
  ├─ action
  ├─ input_summary
  ├─ output_summary
  ├─ risk_level (low | medium | high)
  ├─ metadata (JSONB)
  └─ created_at (immutable)
```

## What Junior Devs Usually Get Wrong

### 1. **Client-Side Security**

❌ **Wrong**: Filtering data in React components

```tsx
// INSECURE - data already leaked to client
const userLogs = allLogs.filter((log) => log.org_id === currentOrg);
```

✅ **Right**: RLS at database level

```sql
-- Security enforced by Postgres, not JavaScript
CREATE POLICY ... USING (organization_id IN (...))
```

### 2. **Mock Multi-Tenancy**

❌ **Wrong**: Trusting client-provided org IDs

```tsx
// INSECURE - attacker can change orgId
fetch(`/api/logs?orgId=${orgId}`);
```

✅ **Right**: Server-side org resolution

```ts
// Server resolves org from authenticated user
const orgs = await getOrgsForUser(user.id);
```

### 3. **Mutable Audit Logs**

❌ **Wrong**: Allowing log updates/deletes

```sql
-- INSECURE - audit trail can be tampered with
CREATE POLICY ... FOR UPDATE ...
```

✅ **Right**: Append-only logs

```sql
-- No UPDATE or DELETE policies = immutable
CREATE POLICY ... FOR INSERT ...
```

## Why This App Is Production-Safe

1. **Database-enforced security**: RLS policies prevent data leaks even if application code has bugs
2. **Immutable audit trail**: Logs cannot be modified or deleted
3. **Deterministic risk detection**: Rule-based (no AI hallucinations in security decisions)
4. **Explicit error handling**: All edge cases handled with clear error messages
5. **Type safety**: Shared Zod schemas between frontend and backend
6. **Monorepo structure**: Single source of truth for data models

## Setup

### Prerequisites

- Node.js 20+
- Supabase account
- npm or yarn

### Installation

```bash
# Install dependencies (from root only)
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials
```

### Database Setup

1. Create a new Supabase project
2. Run the migration:
   ```bash
   # In Supabase SQL Editor, run:
   supabase/migrations/20260129_initial_schema.sql
   ```

### Running Locally

```bash
# Start development server
npm run dev --workspace=web

# The app will be available at http://localhost:3000
```

## Usage

### 1. Sign Up

- Create an account at `/auth/signup`
- Provide organization name (you become admin)

### 2. Simulate AI Action

- Go to `/simulate`
- Enter input/output summaries
- System automatically detects risk level

### 3. View Audit Logs

- Go to `/audit-logs`
- See all AI actions for your organization
- Logs are immutable and scoped to your org

## Security Demo

**Scenario**: User A tries to access Org B's logs

1. User A logs in (belongs to Org A)
2. User A tries to query logs for Org B
3. **Result**: RLS policy blocks the query - zero rows returned

**Proof**:

```sql
-- Even with direct SQL, User A cannot see Org B logs
SELECT * FROM ai_audit_logs WHERE organization_id = '<org-b-id>';
-- Returns: 0 rows (RLS blocks it)
```

## Risk Detection

Risk levels are determined by **deterministic rules** (no AI):

- **High**: PII (SSN, credit cards), passwords, API keys
- **Medium**: Financial terms, payment info
- **Low**: Generic content

## Future Enhancements

- [ ] Stripe billing integration
- [ ] Advanced filtering (date range, risk level)
- [ ] Export audit logs (CSV, JSON)
- [ ] Real-time alerts for high-risk actions
- [ ] Organization member management UI

## Monorepo Structure

```
relynt/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # Backend (future)
├── shared/           # Shared types/schemas
│   └── schemas/      # Zod schemas
├── supabase/
│   └── migrations/   # Database migrations
├── execution/        # Validation scripts
└── package.json      # Root workspace config
```

**IMPORTANT**:

- Only root has `node_modules`
- Apps have `package.json` but NO `node_modules`
- All dependencies installed at root: `npm install`

## License

MIT

---

**Built with production-grade practices. No shortcuts. No mock security.**
