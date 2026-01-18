import { Pool, PoolConfig } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

// PostgreSQL connection configuration
// Support both Unix socket (Cloud SQL Proxy) and TCP/IP connections
const isUnixSocket = process.env.DB_HOST?.startsWith('/cloudsql/');
const dbConfig: PoolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: isUnixSocket ? undefined : parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'dms_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  // SSL only for TCP/IP connections, not for Unix sockets
  ssl: !isUnixSocket && process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  max: parseInt(process.env.DB_POOL_MAX || '20', 10), // Maximum number of clients in the pool
  idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT || '30000', 10),
  connectionTimeoutMillis: parseInt(process.env.DB_POOL_CONNECTION_TIMEOUT || '2000', 10),
};

// Create connection pool
export const pool = new Pool(dbConfig);

// Test database connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err: Error) => {
  console.error('❌ Unexpected error on idle PostgreSQL client', err);
  process.exit(-1);
});

// Helper function to test connection
export async function testConnection(): Promise<boolean> {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connection test successful:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    return false;
  }
}

// Graceful shutdown
export async function closePool(): Promise<void> {
  await pool.end();
  console.log('✅ PostgreSQL connection pool closed');
}

export default pool;
