import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role if possible, or anon if RLS allows

  if (!supabaseServiceKey) {
    return NextResponse.json({ error: 'Missing service role key' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    const { error } = await supabase.rpc('execute_sql', {
      sql_query: "ALTER TABLE organizations ADD COLUMN IF NOT EXISTS subscription_tier TEXT NOT NULL DEFAULT 'starter' CHECK (subscription_tier IN ('starter', 'professional', 'enterprise'));"
    })

    if (error) {
      // If RPC is missing, try a direct query if possible via a known table
      // But usually 'execute_sql' RPC is what agents use.
      // Another way: just use a direct sql fetch if the environment allows it, 
      // but Supabase JS doesn't support direct DDL via .from()
      
      return NextResponse.json({ error: error.message, hint: 'RPC execute_sql might be missing' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
