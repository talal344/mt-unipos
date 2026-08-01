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

-- Enable RLS
ALTER TABLE unipos_collections ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated anon operations (For simplicity in this POS context, though in prod you'd restrict by tenant_id and JWT)
CREATE POLICY "Allow all operations for anon" ON unipos_collections
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- Create App-Level Settings / Users table
CREATE TABLE IF NOT EXISTS unipos_global (
  key VARCHAR PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE unipos_global ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations for anon global" ON unipos_global
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);
