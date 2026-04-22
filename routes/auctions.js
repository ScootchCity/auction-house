import { Router } from 'express'
// TODO: get_active_auctions is not yet exported from mongo/auction.js — see TODO.md
import { get_auction } from '../mongo/auction.js'
import { getActiveAuctions } from '../redis/auction.js'
import { getTopBid } from '../redis/auction.js'
import { submitBid } from '../kafka/producer.js'
import { get_user_bids } from '../postgres/bids.js'

const router = Router()

// Middleware: require a logged-in session for all auction routes
function requireAuth(req, res, next) {
    if (!req.session.user) return res.redirect('/login')
    next()
}

// Browse all active auctions — loads from Redis cache (includes item_name, end_date, top_bid)
// TODO: swap to Mongo once get_active_auctions is exported from mongo/auction.js (see TODO.md)
router.get('/auctions', requireAuth, async (req, res) => {
    const auctions = await getActiveAuctions()
    res.render('auctions', { auctions, user: req.session.user })
})

// Auction detail page
router.get('/auctions/:id', requireAuth, async (req, res) => {
    const auction = await get_auction(parseInt(req.params.id))
    if (!auction) return res.redirect('/auctions')

    const top_bid = await getTopBid(auction.auction_id)
    res.render('auction', { auction: auction.toObject(), top_bid, user: req.session.user, error: req.query.error || null })
})

// User profile — current top bids and won auctions
router.get('/profile', requireAuth, async (req, res) => {
    const bids = await get_user_bids(req.session.user.id)
    const active_bids = bids.filter(b => b.status === 'In-Progress' && b.top_bid)
    const won = bids.filter(b => b.status === 'Finished' && b.top_bid)
    res.render('profile', { user: req.session.user, active_bids, won })
})

// Place a bid
router.post('/bid', requireAuth, async (req, res) => {
    const { auction_id, amount } = req.body
    const parsedAmount = parseFloat(amount)

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.redirect(`/auctions/${auction_id}?error=Invalid+bid+amount`)
    }

    const result = await submitBid(parseInt(auction_id), req.session.user.id, parsedAmount)

    if (!result.valid) {
        return res.redirect(`/auctions/${auction_id}?error=${encodeURIComponent(result.reason)}`)
    }

    res.redirect(`/auctions/${auction_id}`)
})

export default router
