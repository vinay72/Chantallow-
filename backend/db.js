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
  connectionTimeoutMillis: 15000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
});

// Errors that mean we never got a connection (so no query was sent).
const CONNECT_ERROR_CODES = new Set(['ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'EAI_AGAIN']);
function isConnectError(err) {
  return (
    CONNECT_ERROR_CODES.has(err.code) ||
    /connection timeout|timeout exceeded when trying to connect/i.test(err.message || '')
  );
}

// The managed database sometimes takes too long to accept a new connection.
// Connecting is retried a few times; the query itself runs once, so a write
// is never sent twice.
async function connectWithRetry(attempts = 3) {
  for (let i = 1; ; i++) {
    try {
      return await pool.connect();
    } catch (err) {
      if (i >= attempts || !isConnectError(err)) throw err;
      console.warn(`PostgreSQL connect failed (${err.message}); retrying ${i}/${attempts - 1}…`);
      await new Promise((r) => setTimeout(r, 500 * i));
    }
  }
}

// Every pool.query in the app goes through the retrying connect.
const rawQuery = pool.query.bind(pool);
pool.query = async (...args) => {
  if (typeof args[args.length - 1] === 'function') return rawQuery(...args); // callback style: leave as is
  const client = await connectWithRetry();
  try {
    return await client.query(...args);
  } finally {
    client.release();
  }
};

async function testConnection() {
  const client = await connectWithRetry();
  try {
    const res = await client.query('SELECT NOW() as now, current_database() as db');
    return res.rows[0];
  } finally {
    client.release();
  }
}

module.exports = { pool, testConnection, isConnectError };
