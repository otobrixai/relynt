# Local PostgreSQL Setup Guide (Windows)

This guide will help you run Relynt with a local PostgreSQL 16 database on Windows.

## Prerequisites

- PostgreSQL 16 installed on Windows
- Node.js 20+
- npm

## Step 1: Create Database

Open **pgAdmin** or **psql** and run:

```sql
-- Create database
CREATE DATABASE relynt;

-- Connect to the database
\c relynt

-- Create auth schema (Supabase uses this)
CREATE SCHEMA IF NOT EXISTS auth;

-- Create a users table in auth schema
CREATE TABLE IF NOT EXISTS auth.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  encrypted_password TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security on auth.users
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create a simple policy for auth.users (users can see their own data)
CREATE POLICY "Users can view own data"
  ON auth.users
  FOR SELECT
  USING (id = current_setting('app.current_user_id', true)::uuid);
```

## Step 2: Run Main Migration

In **pgAdmin** or **psql**, run the migration file:

```bash
# In psql:
\i C:/Users/mdmho/project/relynt/supabase/migrations/20260129_initial_schema.sql
```

Or copy the contents of `supabase/migrations/20260129_initial_schema.sql` and run it in pgAdmin's Query Tool.

## Step 3: Configure Environment Variables

Update `apps/web/.env.local`:

```env
# PostgreSQL Connection
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/relynt

# For local development, we'll use a mock Supabase URL
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=mock-key-for-local-dev

# PostgreSQL credentials
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=relynt
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password_here
```

## Step 4: Install Supabase CLI (Optional but Recommended)

The Supabase CLI can run a local Supabase instance with Auth:

```bash
# Install Supabase CLI
npm install -g supabase

# Initialize Supabase in your project
cd C:\Users\mdmho\project\relynt
supabase init

# Start local Supabase (includes PostgreSQL, Auth, etc.)
supabase start
```

This will:

- Start a local PostgreSQL database
- Start Supabase Auth service
- Start Supabase Studio (web UI)
- Give you local credentials

**Recommended**: Use this approach as it provides the full Supabase Auth system locally.

## Step 5: Update .env.local with Supabase CLI Credentials

After running `supabase start`, you'll see output like:

```
API URL: http://localhost:54321
anon key: eyJhbGc...
service_role key: eyJhbGc...
```

Update `apps/web/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key-from-output>
```

## Step 6: Apply Migration to Local Supabase

````bash
# Link to local project
supabase db reset

# Or apply migration manually
supabase db push

## Step 7: Start the Application

```bash
cd C:\Users\mdmho\project\relynt\apps\web
npm run dev --workspace=web

1. Open http://localhost:3000
2. Go to `/auth/signup`
3. Create an account
4. You should be redirected to `/dashboard`

## Troubleshooting

### Issue: "relation auth.users does not exist"

**Solution**: Run the auth schema creation SQL from Step 1

### Issue: "connection refused"

**Solution**:

- Check PostgreSQL is running: `pg_ctl status`
- Verify connection string in `.env.local`

### Issue: "Supabase client error"

**Solution**:

- Use Supabase CLI (`supabase start`) for easiest setup
- Or implement custom auth (more complex)

## Alternative: Custom Auth (Without Supabase)

If you don't want to use Supabase CLI, you'll need to:

1. Replace Supabase Auth with NextAuth.js or custom auth
2. Update all auth-related code
3. Implement session management

This is more complex and not recommended for this project.

## Recommended Approach

**Use Supabase CLI** - It provides:

- Local PostgreSQL database
- Auth service (email/password)
- Studio UI for database management
- Compatible with your existing code

No code changes needed!
````
