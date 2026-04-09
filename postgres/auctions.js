import client from "./client.js";
// will return all auctions in progress
// not all info, just perfunctory info for quick display
//is the async actually necessary here? all it seems to do is make impossible to do anything after the await
//TODO: not finished, commented out for now so it doesn't mess with other functions
async function get_active_auctions() {
    const result = await client.query(
        "SELECT item_name, end_date FROM auctions WHERE status = 'In-Progress'",
        function (err, data, fields) {
            if (err) throw err;
            console.log(data.rows); //successfully prints out rows. TODO: set up actual return array
        }
    );
}

// get more detailed info a specific auction
function get_auction_details(auction_item) {

}

// will write a new auction to the postgres database
// like other write functions, return is just a confirmation if the row was successfully written in db
//TODO: figure out how to get account UUID or another identifying feature without compromising data security
async function write_auction(seller, item, desc) {
    const result = client.query(
        "INSERT INTO auctions (seller, item_name, description) VALUES ($1, $2, $3)",
        [seller, item, desc]
    )
    return result.rowCount > 0
}

//TODO: functions for updating auction state and other administrative tasks

get_active_auctions();