import client from "./client.js";
// gets the top bid of an auction
async function get_top_bid(auction_item) {
    const result = await client.query(
        "SELECT amount FROM bids b JOIN auctions a ON a.id = b.auction_id WHERE a.item_name = $1 AND b.top_bid = true;",
        [auction_item],
        function (err, data, fields) {
            if (err) throw err;
            console.log(data.rows);
        }
    )
}

// updates the top bid of an auction
function set_top_bid() {

}

// place a new bid on an auction.
// if it is higher than the current highest bid, set as the new highest bid
function new_bid() {

}

get_top_bid("House of the Dead Original Arcade Machine");