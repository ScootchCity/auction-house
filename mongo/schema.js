import database from "./client.js";
import mongoose from 'mongoose';

await database();

// Auction table. Could use references for ids however it might be easier not to for working with other databases.
const auctions = new mongoose.Schema({
    auction_id: {type: Number, required: true, unique: true},
    seller_id: {type: String, required: true},
    item: {type: String, required: true},
    description: String,
    start_date: {type: Date, default: Date.now},
    end_date: {type: Date, required: true},
    active: {type: Boolean, required: true}
});

// Bids table. Same as above table for references.
const bids = new mongoose.Schema({
    bid_id: {type: Number, required: true, unique: true},
    auction_id: {type: Number, required: true},
    account_id: {type: Number, required: true},
    amount: {type: Number, required: true},
    top_bid: {type: Boolean, required: true},
    created_at: {type: Date, default: Date.now}
});

export const auctionsExport = mongoose.model('Auctions', auctions);
export const bidsExport = mongoose.model('Bids', bids);