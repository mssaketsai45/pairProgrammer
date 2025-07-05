// Test database connection and show tables
const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
console.log('Testing connection to:', connectionString?.replace(/:[^:@]*@/, ':****@'));

const client = postgres(connectionString, { max: 1 });
const db = drizzle(client);

async function testDatabase() {
  try {
    console.log('🔗 Testing database connection...');
    
    // Test basic connection
    const result = await client`SELECT version()`;
    console.log('✅ Connection successful!');
    console.log('PostgreSQL version:', result[0].version);
    
    // List all tables
    const tables = await client`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    console.log('\n📋 Available tables:');
    tables.forEach(table => console.log(`  - ${table.table_name}`));
    
    // Check if room table exists and its structure
    const roomColumns = await client`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'room' AND table_schema = 'public'
      ORDER BY ordinal_position
    `;
    
    if (roomColumns.length > 0) {
      console.log('\n🏠 Room table structure:');
      roomColumns.forEach(col => 
        console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`)
      );
    } else {
      console.log('\n❌ Room table not found! Please run the SQL schema.');
    }
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
  } finally {
    await client.end();
  }
}

testDatabase();
