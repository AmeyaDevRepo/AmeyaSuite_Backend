const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://postgres:SO5U5lHzJvOemq6o@db.bdibqwjwfdsdnvpsemqj.supabase.co:5432/postgres?sslmode=require",
});

client.connect()
  .then(() => {
    console.log("✅ Connected to Supabase!");
    return client.end();
  })
  .catch(err => {
    console.error("❌ Connection failed:", err);
  });
