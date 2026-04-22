import client from "./client.js";
import { write_starting_bid } from "./bids.js";

// will return all auctions in progress
// not all info, just perfunctory info for quick display
//TODO: not finished, commented out for now so it doesn't mess with other functions
async function get_active_auctions() {
    const result = await client.query("SELECT item_name, end_date FROM auctions WHERE status = 'In-Progress'");
    //console.log(result);
    return result.rows;
}

// get more detailed info a specific auction
async function get_auction_details(auction_item) {
    const result = await client.query("SELECT item_name, end_date, description FROM auctions WHERE item_name = $1", [auction_item]);
    //console.log(result);
    return result.rows;
}

// will write a new auction to the postgres database
// like other write functions, return is just a confirmation if the row was successfully written in db
//TODO: figure out how to get account UUID or another identifying feature without compromising data security
async function write_auction(seller, item, desc) {
    const result = await client.query(
        "INSERT INTO auctions (seller, item_name, description) VALUES ($1, $2, $3) RETURNING id",
        [seller, item, desc]
    );
    const id = result.rows[0].id;
    const bid_result = await write_starting_bid(id, seller);
    return result.rowCount > 0
}

//Note: these functions have to be awaited to work, like below
// const auctions = await get_active_auctions();
// console.log(auctions);
//TODO: functions for updating auction state and other administrative tasks

async function finish_auction(id) {
    await client.query(
        "UPDATE auctions SET status = 'Finished' WHERE id = $1",
        [id]
    )
}

async function get_active_auction_schedules() {
    const result = await client.query(
        "SELECT id, end_date FROM auctions WHERE status = 'In-Progress'"
    )
    return result.rows
}

export { get_active_auctions, get_auction_details, write_auction, finish_auction, get_active_auction_schedules }
