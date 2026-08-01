const { Client } = require('pg');

const connectionString = 'postgres://postgres:6dXH$TVh-mQfL-E@db.choporbupzykmrqvbzve.supabase.co:5432/postgres';

const client = new Client({
  connectionString,
});

async function init() {
  await client.connect();
  console.log('Connected to PostgreSQL');

  const query = `
    -- Enable UUID extension
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    -- Create Document Store for generic collections
    CREATE TABLE IF NOT EXISTS unipos_collections (
      tenant_id VARCHAR NOT NULL,
      collection VARCHAR NOT NULL,
      item_id VARCHAR NOT NULL,
      data JSONB NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (tenant_id, collection, item_id)
    );

    -- Create App-Level Settings / Users table
    CREATE TABLE IF NOT EXISTS unipos_global (
      key VARCHAR PRIMARY KEY,
      value JSONB NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await client.query(query);
    console.log('Schema created successfully.');
  } catch (err) {
    console.error('Error creating schema:', err);
  } finally {
    await client.end();
  }
}

init();
