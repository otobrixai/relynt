# Quick Start: Local PostgreSQL on Windows

## Option 1: Install Supabase CLI (Recommended)

### Using Scoop (Windows Package Manager)

```powershell
# Install Scoop if you don't have it
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression

# Install Supabase CLI
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### Or Download Binary Directly

1. Go to: https://github.com/supabase/cli/releases
2. Download `supabase_windows_amd64.zip`
3. Extract to `C:\Program Files\Supabase\`
4. Add to PATH

### Then Run:

```powershell
cd C:\Users\mdmho\project\relynt

# Initialize Supabase
supabase init

# Start local Supabase (includes PostgreSQL + Auth)
supabase start
```

This will output:

```
API URL: http://localhost:54321
anon key: eyJhbGc...
service_role key: eyJhbGc...
```

Update `apps/web/.env.local` with these values.

---

## Option 2: Use Existing PostgreSQL 16 (Manual Setup)

If you already have PostgreSQL 16 running, you can use it directly but you'll need to handle auth manually.

### Step 1: Create Database

```sql
-- In pgAdmin or psql
CREATE DATABASE relynt;
```

### Step 2: Run Migration

Copy contents of `supabase/migrations/20260129_initial_schema.sql` and run in pgAdmin.

### Step 3: Install Additional Dependencies

```powershell
cd C:\Users\mdmho\project\relynt
npm install pg @neondatabase/serverless --workspace=web
npm install bcryptjs jsonwebtoken --workspace=web
npm install @types/bcryptjs @types/jsonwebtoken --workspace=web --save-dev
```

### Step 4: Update .env.local

```env
# PostgreSQL Direct Connection
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/relynt

# Auth Secret (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-here

# Disable Supabase (we'll use custom auth)
USE_CUSTOM_AUTH=true
```

### Step 5: I'll Create Custom Auth Files

This requires creating:

- Custom login/signup API routes
- Session management
- Password hashing

**This is more complex** - I can implement this if you prefer, but Supabase CLI is much easier.

---

## Option 3: Use Supabase Cloud (Easiest)

1. Go to https://supabase.com
2. Create free account
3. Create new project
4. Get credentials from Settings → API
5. Update `.env.local`

**Free tier includes**:

- 500MB database
- 50,000 monthly active users
- Perfect for development

---

## Recommendation

**Use Option 1 (Supabase CLI)** because:

- ✅ Works with existing code (no changes needed)
- ✅ Provides local PostgreSQL + Auth
- ✅ Free and open source
- ✅ Easy to set up

**Or use Option 3 (Supabase Cloud)** if you want the absolute easiest setup.

---

## Next Steps

Which option would you like to proceed with?

1. **Supabase CLI** - I'll help you install it
2. **Custom Auth** - I'll create the auth system for your local PostgreSQL
3. **Supabase Cloud** - Just need your credentials
