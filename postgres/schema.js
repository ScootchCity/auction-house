import client from './client.js'

//stores all user accounts
await client.query(` 
  CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(25) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
  )
`)
//create auction table = stores all auctions, active + finished
//seller references the account of UUID or whoever created auction
// end_date = 4 days default after creation (96 hours)
// IMPORTANT: EVERY AUCTION MUST HAVE A 'STARTER' BID FOR THE TOP BID SYSTEM TO WORK CORRECTLY
await client.query(`
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
//create bids table - stores every bid placed on any auction
//top_bid = flag marks which bid is currently highest for given auction
//auction_id + account_id reference their own respective tables
await client.query(`
  CREATE TABLE IF NOT EXISTS bids (
    id BIGSERIAL PRIMARY KEY,
    auction_id INT NOT NULL REFERENCES auctions(id),
    account_id UUID REFERENCES accounts(id),
    amount FLOAT,
    top_bid BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
  )
`)

console.log('postgres schema ready')
process.exit(0)