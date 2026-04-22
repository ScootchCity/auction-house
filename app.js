import express from 'express'
import session from 'express-session'
import { createClient } from 'redis'
import { RedisStore } from 'connect-redis'
import 'dotenv/config'

import { run as runBidProcessor } from './kafka/bidProcessor.js'
import { get_active_auction_schedules } from './postgres/auctions.js'
import { scheduleExpiry } from './scheduler.js'
import authRoutes from './routes/auth.js'
import auctionRoutes from './routes/auctions.js'

const app = express()

// Redis client for session store (separate from ioredis client used elsewhere)
const sessionRedis = createClient({
    socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
    }
})
await sessionRedis.connect()

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.set('view engine', 'ejs')
app.set('views', './views')

app.use(session({
    store: new RedisStore({ client: sessionRedis }),
    secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 1000 * 60 * 60 * 4 }, // 4 hour session
}))

await runBidProcessor()

const activeAuctions = await get_active_auction_schedules()
for (const a of activeAuctions) scheduleExpiry(a.id, a.end_date)
console.log(`[scheduler] ${activeAuctions.length} auction(s) scheduled for expiry`)

app.use('/', authRoutes)
app.use('/', auctionRoutes)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`auction house running at http://localhost:${PORT}`))
