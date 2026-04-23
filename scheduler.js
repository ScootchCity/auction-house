import { finish_auction } from './postgres/auctions.js'
import { deleteAuction } from './redis/auction.js'

const MAX_DELAY_MS = 20 * 24 * 60 * 60 * 1000 // 20 days

export function scheduleExpiry(auction_id, end_date) {
    const delay = new Date(end_date) - Date.now()

    // already expired — finish immediately
    if (delay <= 0) {
        finish_auction(auction_id).then(() => deleteAuction(auction_id))
        console.log(`[scheduler] auction ${auction_id} already expired, finishing now`)
        return
    }

    // beyond 20 days — re-schedule in chunks until we're close enough to fire
    if (delay > MAX_DELAY_MS) {
        setTimeout(() => scheduleExpiry(auction_id, end_date), MAX_DELAY_MS)
        return
    }

    setTimeout(async () => {
        await finish_auction(auction_id)
        await deleteAuction(auction_id)
        console.log(`[scheduler] auction ${auction_id} expired`)
    }, delay)
}
