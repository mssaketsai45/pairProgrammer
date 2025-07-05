const { Client } = require('pg');

async function checkTables() {
  const client = new Client({
    connectionString: 'postgresql://postgres:devfinder-backend@db.dfuwlicbgkapmvvsrdzf.supabase.co:5432/postgres'
  });

  try {
    await client.connect();
    console.log('Connected to database');
    
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('Existing tables:');
    result.rows.forEach(row => {
      console.log('- ' + row.table_name);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

checkTables();
