# Next Steps: Complete Local Setup

## ✅ Step 1: Supabase CLI Installed

You've successfully installed Supabase CLI via Scoop!

## 🔄 Step 2: Restart PowerShell

The `supabase` command isn't available yet because your PowerShell session needs to reload the PATH.

**Close and reopen your PowerShell terminal**, then verify:

```powershell
supabase --version
# Should show: 2.72.7
```

## 🚀 Step 3: Initialize Supabase in Your Project

```powershell
cd C:\Users\mdmho\project\relynt
supabase init
```

This creates a `supabase/` folder with configuration.

## ▶️ Step 4: Start Local Supabase

```powershell
supabase start
```

This will:

- Download Docker images (first time only, ~2-3 minutes)
- Start local PostgreSQL
- Start Supabase Auth
- Start Supabase Studio

**Important**: This requires Docker Desktop to be installed and running.

### Don't have Docker?

If you don't have Docker Desktop:

1. Download from: https://www.docker.com/products/docker-desktop/
2. Install and start Docker Desktop
3. Then run `supabase start`

### Alternative: Use Supabase Cloud Instead

If you prefer not to install Docker, use Supabase Cloud (free tier):

1. Go to https://supabase.com
2. Sign up (free)
3. Create new project
4. Copy credentials from Settings → API
5. Update `apps/web/.env.local`

## 📝 Step 5: Copy Credentials

After `supabase start` completes, you'll see:

```
API URL: http://localhost:54321
anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Update `apps/web/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<paste-anon-key-here>
```

## 🗄️ Step 6: Apply Database Migration

```powershell
# This applies your migration to the local database
supabase db reset
```

Or manually in Supabase Studio:

1. Open http://localhost:54323 (Studio UI)
2. Go to SQL Editor
3. Copy contents of `supabase/migrations/20260129_initial_schema.sql`
4. Run it

## 🎯 Step 7: Start Your App

```powershell
cd C:\Users\mdmho\project\relynt
npm run dev --workspace=web
```

Open http://localhost:3000

## ✨ Step 8: Test It

1. Go to http://localhost:3000/auth/signup
2. Create account with:
   - Email: test@example.com
   - Password: password123
   - Organization: Test Org
3. You should be redirected to dashboard
4. Go to `/simulate` to create an audit log
5. View logs at `/audit-logs`

## 🐛 Troubleshooting

### "Docker is not running"

- Start Docker Desktop
- Wait for it to fully start (whale icon in system tray)
- Run `supabase start` again

### "Port already in use"

- Another service is using port 54321
- Stop it or change Supabase port in `supabase/config.toml`

### "Migration failed"

- Check SQL syntax in migration file
- View logs: `supabase status`

## 📚 Useful Commands

```powershell
# Check status
supabase status

# Stop local Supabase
supabase stop

# View logs
supabase logs

# Open Studio UI
start http://localhost:54323
```

---

**Next**: Restart your PowerShell and run `supabase --version` to verify installation.
