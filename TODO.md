# TODOs

---

## Web GUI

- [ ] Dev-only page (`/dev`) to manually force-close any active auction — useful for demoing expiry and win history without waiting for `end_date`.
- [ ] Wire up auction creation via the web GUI — `write_auction()` exists in `postgres/auctions.js` but there's no web form yet. When added, call `scheduleExpiry()` from `scheduler.js` at creation time.
- [ ] Show seller username on auction detail page — deferred until auction pages are migrated to Mongo as source of truth (`seller_id` is in Mongo but username lookup still needs a Postgres JOIN).

### Polling enhancements
- [ ] `/auctions/:id/top_bid` endpoint should also return auction `status` — client JS can then hide the bid form and show "This auction has ended" when status comes back `'Finished'`, without needing a page reload.
- [ ] Use the same polling mechanism to notify the user when they've been outbid — if the top bid changes and the current user is no longer the top bidder, show a notification.
- [ ] Notify the user when they've won — if auction status flips to `'Finished'` and the current user holds the top bid, show a win notification.
- [ ] For outbid/win notifications, the `/top_bid` endpoint will need to also return the `account_id` of the current top bidder so the client can compare it against the logged-in user's ID.

---

## PostgreSQL

**`postgres/auctions.js`**
- [ ] `write_auction(seller, item, desc)` — now that `get_UUID()` exists in `users.js`, wire it up so the seller UUID is looked up and passed in correctly.
- [ ] Add character limit to `auctions.description` at the DB level.

---

## MongoDB

**`mongo/auction.js`**
- [ ] `get_active_auctions()` has a bug: `.sort()` is chained after an already-resolved `await`, so sorting does nothing. Fix: `auctionsExport.find({ active: true }).sort({ end_date: 1 }).limit(10)`
- [ ] `get_active_auctions()` is not exported — needed before the auction listing page can be migrated from Redis to Mongo as source of truth.
