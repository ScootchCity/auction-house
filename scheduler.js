import { finish_auction } from './postgres/auctions.js'
import { deleteAuction } from './redis/auction.js'

export function scheduleExpiry(auction_id, end_date) {
    const delay = new Date(end_date) - Date.now()

    // if already past end_date (e.g. after server restart), expire immediately
    const fireIn = Math.max(delay, 0)

    setTimeout(async () => {
        await finish_auction(auction_id)
        await deleteAuction(auction_id)
        console.log(`[scheduler] auction ${auction_id} expired`)
    }, fireIn)
}
