const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const client = new Client({
    connectionString: 'postgresql://postgres:devfinder-backend@db.dfuwlicbgkapmvvsrdzf.supabase.co:5432/postgres'
  });

  try {
    await client.connect();
    console.log('Connected to database');
    
    const sql = fs.readFileSync(path.join(__dirname, 'database/add-nextauth-tables.sql'), 'utf8');
    await client.query(sql);
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await client.end();
  }
}

runMigration();
