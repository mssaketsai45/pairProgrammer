const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');

// Database connection string
const connectionString = process.env.DATABASE_URL || 
  'postgresql://postgres:your_new_password@localhost:5432/devfinder';

console.log('🔗 Connecting to database...');

// Create PostgreSQL client
const client = postgres(connectionString, {
  max: 10, // Maximum connections in pool
  idle_timeout: 20, // Close idle connections after 20 seconds
  connect_timeout: 10 // Timeout after 10 seconds if can't connect
});

// Create Drizzle database instance
const db = drizzle(client);

// Test database connection
const testConnection = async () => {
  try {
    await client`SELECT 1`;
    console.log('✅ Database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

// Initialize connection test
testConnection();

module.exports = { db, client, testConnection };
