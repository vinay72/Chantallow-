const { Pool } = require('pg');

// DigitalOcean managed PostgreSQL requires SSL. Their cert chain isn't always
// present in Node's default trust store, so we enable SSL without strict CA
// verification. If you download DO's CA certificate you can tighten this
// (set rejectUnauthorized: true and pass `ca`).
const pool = new Pool({
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT || 25060),
  database: process.env.PGDATABASE,
  ssl:
    process.env.PGSSLMODE === 'disable'
      ? false
      : { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
});

async function testConnection() {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT NOW() as now, current_database() as db');
    return res.rows[0];
  } finally {
    client.release();
  }
}

module.exports = { pool, testConnection };
