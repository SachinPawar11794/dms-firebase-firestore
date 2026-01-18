// Quick database connection test
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

console.log('Testing database connection...');
console.log('Host:', process.env.DB_HOST);
console.log('Database:', process.env.DB_NAME);
console.log('User:', process.env.DB_USER);

pool.query('SELECT NOW()')
  .then(result => {
    console.log('✅ Database connection successful!');
    console.log('Current time:', result.rows[0].now);
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Database connection failed!');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    process.exit(1);
  });
