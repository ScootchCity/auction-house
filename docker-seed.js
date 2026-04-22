// docker-seed.js — runs once at container startup to initialize all databases.
// Order matters: Postgres schema + data must exist before Redis seeds from it.
// Mongo is independent but auction_id values must match Postgres insert order.

import pgClient from './postgres/client.js'
import redisClient from './redis/client.js'
import { setAuction } from './redis/auction.js'
import database from './mongo/client.js'
import { auctionsExport } from './mongo/schema.js'

// ── 1. Postgres: create tables ───────────────────────────────────────────────

await pgClient.query(`
  CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(25) NOT NULL UNIQUE,
    password VARCHAR(260) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
  )
`)

await pgClient.query(`
  CREATE TABLE IF NOT EXISTS auctions (
    id BIGSERIAL PRIMARY KEY,
    seller UUID NOT NULL REFERENCES accounts(id),
    item_name VARCHAR(100) NOT NULL,
    description VARCHAR(1000),
    start_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP + interval '4 days',
    status VARCHAR(20) CHECK (status IN ('In-Progress', 'Finished'))
  )
`)

await pgClient.query(`
  CREATE TABLE IF NOT EXISTS bids (
    id BIGSERIAL PRIMARY KEY,
    auction_id INT NOT NULL REFERENCES auctions(id),
    account_id UUID REFERENCES accounts(id),
    amount FLOAT,
    top_bid BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
  )
`)

console.log('[seed] postgres schema ready')

// ── 2. Postgres: seed accounts + auctions ────────────────────────────────────

await pgClient.query(`
  INSERT INTO accounts (email, username, password)
  VALUES
    ('calvin.dibartolo@mymail.champlain.edu', 'cdibartolo05', 'b6e28cdced87d18b3cfd35534251e6bf77234848e70c3fc622a1b0a0b5cacac9'),
    ('ashish.subedi@mymail.champlain.edu',    'asheesh8',     '6217f6c0fc314ead884a6bdba65a776c0aae5f8d8efd6f19bbf1eaa709189cfa'),
    ('lloyd.ivester@mymail.champlain.edu',    'ScootchCity',  'b365de03fb81795573e4f9de60e53af894df858ba44c82cb4a302d9ec2beb5b9'),
    ('logan.donaghue@mymail.champlain.edu',   'Loganest2110', '768b3083b45077cb63e0ef68cf91e4d03ae85f8f1eb89290bbfc376d168e814e')
  ON CONFLICT DO NOTHING
`)

// Only seed auctions if none exist yet — prevents duplicate rows on re-run
const existing = await pgClient.query(`SELECT COUNT(*) FROM auctions`)
if (parseInt(existing.rows[0].count) === 0) {
  await pgClient.query(`
    INSERT INTO auctions (seller, item_name, description, status)
    VALUES
      ((SELECT id FROM accounts WHERE email = 'calvin.dibartolo@mymail.champlain.edu'), '2015 Honda Civic',                        'Good condition, mostly spare parts',    'In-Progress'),
      ((SELECT id FROM accounts WHERE email = 'ashish.subedi@mymail.champlain.edu'),    'House of the Dead Original Arcade Machine','Heavily used, one light-gun broken',    'In-Progress'),
      ((SELECT id FROM accounts WHERE email = 'lloyd.ivester@mymail.champlain.edu'),    'Orange Game Cube',                         NULL,                                    'In-Progress')
  `)
}

console.log('[seed] postgres data ready')

// ── 3. Mongo: seed auction documents ─────────────────────────────────────────
// auction_id values match Postgres BIGSERIAL insert order (1, 2, 3)

await database()

const mongoAuctions = [
  { auction_id: 1, seller_id: 1, item: '2015 Honda Civic',                         description: 'Good condition, mostly spare parts',  end_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), active: true },
  { auction_id: 2, seller_id: 2, item: 'House of the Dead Original Arcade Machine', description: 'Heavily used, one light-gun broken',   end_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), active: true },
  { auction_id: 3, seller_id: 3, item: 'Orange Game Cube',                          description: null,                                   end_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), active: true },
]

for (const a of mongoAuctions) {
  await auctionsExport.findOneAndUpdate(
    { auction_id: a.auction_id },
    a,
    { upsert: true, new: true }
  )
}

console.log('[seed] mongo data ready')

// ── 4. Redis: cache active auctions from Postgres ────────────────────────────
// Flush any stale auction keys first so re-runs don't leave duplicates
const staleKeys = await redisClient.keys('auction:*')
if (staleKeys.length > 0) await redisClient.del(...staleKeys)

const result = await pgClient.query(`
  SELECT id, seller, item_name, description, status, end_date
  FROM auctions
  WHERE status = 'In-Progress'
`)

for (const row of result.rows) {
  await setAuction({ ...row, top_bid: 0 })
  console.log(`[seed] redis cached: ${row.item_name}`)
}

console.log('[seed] all databases ready')
await pgClient.end()
process.exit(0)
