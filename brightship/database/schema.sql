-- BrightShip Tracker — database schema
-- Run this to initialise the database from scratch
-- Last updated: Kofi (March, before he left in a hurry)

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS shipments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender       VARCHAR(255) NOT NULL,
  recipient    VARCHAR(255) NOT NULL,
  origin       VARCHAR(255) NOT NULL,
  destination  VARCHAR(255) NOT NULL,
  weight_kg    NUMERIC(8,2),
  status       VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  created_at   TIMESTAMP DEFAULT NOW(),
  updated_at   TIMESTAMP DEFAULT NOW()
);

-- seed data so the app doesn't look empty on first run
INSERT INTO shipments (sender, recipient, origin, destination, weight_kg, status) VALUES
  ('Adebayo Stores',    'Chidi Okonkwo',  'Lagos',   'Abuja',          2.5,  'IN_TRANSIT'),
  ('Zara Fashion NG',   'Amaka Eze',      'Lagos',   'Port Harcourt',  0.8,  'DELIVERED'),
  ('TechGadgets Ltd',   'Emeka Nwosu',    'Abuja',   'Lagos',          5.0,  'PENDING'),
  ('HomeGoods Express', 'Fatima Aliyu',   'Kano',    'Lagos',         12.3,  'PICKED_UP'),
  ('BookWorld NG',      'Seun Adeyemi',   'Lagos',   'Ibadan',         1.2,  'DELIVERED');
