import client from "./client.js";
// gets the top bid of an auction
// should this also return the account, or should that be kept anonymous?
async function get_top_bid(auction_item) {
    const result = await client.query("SELECT amount FROM bids b JOIN auctions a ON a.id = b.auction_id WHERE a.item_name = $1 AND b.top_bid = true;", [auction_item]);
    return result.rows[0]?.amount ?? null;
}

// updates the top bid of an auction
// todo: add function for demarking the existing top bid
async function set_top_bid(bid_id, auction_id) {
    await client.query("UPDATE bids SET top_bid = FALSE WHERE auction_id = $1 AND top_bid = TRUE", [auction_id]);
    const result = await client.query("UPDATE bids SET top_bid = TRUE WHERE id = $1;", [bid_id]);
    return result.rowCount > 0;
}

// place a new bid on an auction.
// auction_id is the postgres integer ID, account_id is the account UUID
async function write_bid(auction_id, account_id, amount) {
    const result = await client.query(
        "INSERT INTO bids (auction_id, account_id, amount) VALUES ($1, $2, $3) RETURNING id",
        [auction_id, account_id, amount]
    );
    return result.rows[0].id;
}

// todo: add write_baseline_bid
async function write_starting_bid(auction_id, account_id) {
    const result = await client.query(
        "INSERT INTO bids (auction_id, account_id, amount, top_bid) VALUES ($1, $2, 0.01, TRUE)",
        [auction_id, account_id]
    );
    return result.rowCount > 0;
}
//be careful leaving these tests. they are called every time we import!
//get_top_bid("House of the Dead Original Arcade Machine");
//set_top_bid(4);

async function get_user_bids(account_id) {
    const result = await client.query(
        `SELECT b.amount, b.top_bid, a.id AS auction_id, a.item_name, a.status
         FROM bids b
         JOIN auctions a ON a.id = b.auction_id
         WHERE b.account_id = $1
         ORDER BY b.created_at DESC`,
        [account_id]
    );
    return result.rows;
}

export { get_top_bid, set_top_bid, write_bid, write_starting_bid, get_user_bids };