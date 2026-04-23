import { Router } from 'express'
import { get_auction, create_auction } from '../mongo/auction.js'
import { getActiveAuctions, setAuction, getAuction, getTopBid, pushChatMessage, getChatMessages, deleteAuction } from '../redis/auction.js'
import { submitBid } from '../kafka/producer.js'
import { get_user_bids } from '../postgres/bids.js'
import { write_auction, finish_auction } from '../postgres/auctions.js'
import { get_username_by_id } from '../postgres/users.js'
import { scheduleExpiry } from '../scheduler.js'

const router = Router()

// Middleware: require a logged-in session for all auction routes
function requireAuth(req, res, next) {
    if (!req.session.user) return res.redirect('/login')
    next()
}

// Create auction form
router.get('/auctions/create', requireAuth, (req, res) => {
    res.render('create_auction', { user: req.session.user, error: null, values: { item: '', description: '', days: '', hours: '' } })
})

// Create auction submission
router.post('/auctions/create', requireAuth, async (req, res) => {
    const { item, description, days, hours } = req.body
    const totalMinutes = (parseInt(days) || 0) * 24 * 60 + (parseInt(hours) || 0) * 60
    const endDate = new Date(Date.now() + totalMinutes * 60000)

    let errorMsg = null
    if (!item) errorMsg = 'Item name is required.'
    else if (totalMinutes < 60) errorMsg = 'Auction must last at least 1 hour.'
    else if (totalMinutes > 20 * 24 * 60) errorMsg = 'Auction cannot last more than 20 days.'

    if (errorMsg) {
        return res.render('create_auction', {
            user: req.session.user,
            error: errorMsg,
            values: { item, description, days: days || '', hours: hours || '' }
        })
    }

    // Write to Postgres — returns the new auction id and end_date
    const pgAuction = await write_auction(req.session.user.id, item, description || null, endDate)
    if (!pgAuction) return res.redirect('/auctions/create?error=Failed+to+create+auction')

    // Write to Mongo
    await create_auction({
        sellerUUID: req.session.user.id,
        item,
        description: description || null,
        endDate,
        auctionId: pgAuction.id,
    })

    // Seed Redis cache so the auction appears immediately
    await setAuction({
        id: pgAuction.id,
        item_name: item,
        description: description || '',
        status: 'In-Progress',
        end_date: pgAuction.end_date,
        top_bid: 0,
        seller: req.session.user.id,
    })

    // Schedule expiry
    scheduleExpiry(pgAuction.id, pgAuction.end_date)

    res.redirect('/auctions')
})

// Browse all active auctions — loads from Redis cache
router.get('/auctions', requireAuth, async (req, res) => {
    const auctions = await getActiveAuctions()
    res.render('auctions', { auctions, user: req.session.user })
})

// Auction detail page
router.get('/auctions/:id', requireAuth, async (req, res) => {
    const auction = await get_auction(parseInt(req.params.id))
    if (!auction) return res.redirect('/auctions')

    const top_bid = await getTopBid(auction.auction_id)
    const seller_username = await get_username_by_id(auction.seller_id) ?? 'Unknown'
    const messages = await getChatMessages(auction.auction_id)

    res.render('auction', { auction: auction.toObject(), top_bid, seller_username, messages, user: req.session.user, error: req.query.error || null })
})

// User profile — current top bids and won auctions
router.get('/profile', requireAuth, async (req, res) => {
    const bids = await get_user_bids(req.session.user.id)
    const active_bids = bids.filter(b => b.status === 'In-Progress' && b.top_bid)
    const won = bids.filter(b => b.status === 'Finished' && b.top_bid)
    res.render('profile', { user: req.session.user, active_bids, won })
})

// Top bid polling endpoint — returns current top bid as JSON for client-side updates
router.get('/auctions/:id/top_bid', requireAuth, async (req, res) => {
    const top_bid = await getTopBid(parseInt(req.params.id))
    res.json({ top_bid })
})

// Place a bid
router.post('/bid', requireAuth, async (req, res) => {
    const { auction_id, amount } = req.body
    const parsedAmount = parseFloat(amount)

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.redirect(`/auctions/${auction_id}?error=Invalid+bid+amount`)
    }

    const auctionData = await getAuction(parseInt(auction_id))
    if (auctionData?.seller === req.session.user.id) {
        return res.redirect(`/auctions/${auction_id}?error=You+cannot+bid+on+your+own+auction`)
    }

    const result = await submitBid(parseInt(auction_id), req.session.user.id, parsedAmount)

    if (!result.valid) {
        return res.redirect(`/auctions/${auction_id}?error=${encodeURIComponent(result.reason)}`)
    }

    res.redirect(`/auctions/${auction_id}?just_bid=1`)
})

//chat + dev routes
// /auctions/:id/chat = POST saves message to REDIS = get returns all messages
// for polling. /dev - list active auctions, /dev/close/:id force finish auction for demo
router.post('/auctions/:id/chat', requireAuth, async (req, res) => {
    const { message } = req.body
    const auctionId = parseInt(req.params.id)
    if (!message || !message.trim()) return res.status(400).json({ error: 'Empty message' })
    await pushChatMessage(auctionId, req.session.user.username, message.trim())
    res.json({ ok: true })
})

router.get('/auctions/:id/chat', requireAuth, async (req, res) => {
    const messages = await getChatMessages(parseInt(req.params.id))
    res.json({ messages })
})

router.get('/dev', requireAuth, async (req, res) => {
    const auctions = await getActiveAuctions()
    res.render('dev', { auctions, user: req.session.user, closed: req.query.closed || null })
})

router.post('/dev/close/:id', requireAuth, async (req, res) => {
    const id = parseInt(req.params.id)
    await finish_auction(id)
    await deleteAuction(id)
    console.log(`[dev] manually closed auction ${id}`)
    res.redirect('/dev?closed=' + id)
})
export default router
