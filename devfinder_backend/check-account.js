const { Client } = require('pg');

async function checkAccountTable() {
  const client = new Client({
    connectionString: 'postgresql://postgres:devfinder-backend@db.dfuwlicbgkapmvvsrdzf.supabase.co:5432/postgres'
  });

  try {
    await client.connect();
    console.log('Connected to database');
    
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'account' 
      ORDER BY ordinal_position;
    `);
    
    console.log('Account table columns:');
    result.rows.forEach(row => {
      console.log(`- ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

checkAccountTable();
