const { Client } = require('pg');

async function fix() {
  const client = new Client({
    connectionString: "postgresql://postgres:postgres@127.0.0.1:6543/postgres"
  });

  try {
    await client.connect();
    console.log("Connected to database.");
    
    const res = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'organizations' AND column_name = 'subscription_tier'
    `);

    if (res.rows.length === 0) {
      console.log("subscription_tier column missing. Adding it...");
      await client.query(`
        ALTER TABLE organizations 
        ADD COLUMN subscription_tier TEXT NOT NULL DEFAULT 'starter' 
        CHECK (subscription_tier IN ('starter', 'professional', 'enterprise'));
      `);
      console.log("Column added successfully.");
    } else {
      console.log("subscription_tier column already exists.");
    }
  } catch (err) {
    console.error("Error fixing database:", err);
  } finally {
    await client.end();
  }
}

fix();
