--Put schema creation here if needed
--TODO: NOT FINISHED, MORE WORK NEEDED

-- Table Creation
-- Accounts: contains all user accounts
-- TODO: HASH AND DE-HASH PASSWORDS (REMEMBER TO ADD SUFFIX TO MAKE HAS HARDER TO DECODE)
CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(25) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, --replace with pw_hash
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    --TODO: give some sort of constraint to password for added security?
);

-- Auctions: contains all auctions, finished or in progress
CREATE TABLE IF NOT EXISTS auctions (
    id BIGSERIAL PRIMARY KEY,
    seller UUID NOT NULL REFERENCES accounts(id),
    item_name VARCHAR(100) NOT NULL,
    description VARCHAR(1000),
    start_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP + interval '4 days',
    status VARCHAR(20) CHECK (status IN ('In-Progress', 'Finished'))
    --NOTE: due to circular references, top_bid is being moved to bids
);

-- Bids: contains all bids made on auctions, past and present (how long should all this data stay for? forever?)
CREATE TABLE IF NOT EXISTS bids (
    id BIGSERIAL PRIMARY KEY,
    auction_id INT NOT NULL REFERENCES auctions(id),
    account_id UUID REFERENCES accounts(id),
    amount FLOAT,
    top_bid BOOLEAN,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    --TODO: adjust type to reflect actual money values
);

-- TODO: Do we want any sort of event log here, or do the existing tables pretty much cover that?