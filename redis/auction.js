import client from './client.js'

//all auction data is stored in Redis as Hash under the key: 'auction:{id}'
//fields: item_name, description, status, end_date, top_bid, seller

//cache full auction object into Redis
//called when seeding from postgres OR when new auction is created
async function setAuction(auction) {
  const key = `auction:${auction.id}`

  //write all auction fields as Redis Hash
  await client.hset(key, {
    item_name: auction.item_name,
    description: auction.description ?? '', // default = empty string if null
    status: auction.status,
    end_date: auction.end_date?.toISOString?.() ?? auction.end_date ?? '',
    top_bid: auction.top_bid ?? 0,//default 0 if no bids yet
    seller: auction.seller ?? '',
  })

  // TTL matches actual end_date so the key doesn't outlive or prematurely drop the auction
  if (auction.status === 'In-Progress' && auction.end_date) {
    const ttlSeconds = Math.max(Math.floor((new Date(auction.end_date) - Date.now()) / 1000), 1)
    await client.expire(key, ttlSeconds)
  }
}

//fetch all cached fields for one auction by its postgres id
//returns null if the auction isn't in the cache

async function getAuction(id) {
  const data = await client.hgetall(`auction:${id}`)

  //hgetall returns an empty object if key doesn't exist
  if (!data || Object.keys(data).length === 0) return null

  return {
    ...data,
    top_bid: parseFloat(data.top_bid) || 0,//parse top_bid back to a number
  }
}

//get just the current top bid amount for an auction
async function getTopBid(id) {
  const val = await client.hget(`auction:${id}`, 'top_bid')
  return parseFloat(val) || 0
}

//update the top bid only if the new amount beats the current one
//returns true if the bid was accepted, false if it was too low
async function setTopBid(id, amount) {
  const current = await getTopBid(id)

  //reject bid if it doesn't beat current top
  if (amount <= current) return false

  await client.hset(`auction:${id}`, 'top_bid', amount)
  return true
}

//return all auctions currently marked as 'In-Progress' from the cache
//scans all auction: * keys and filters by status field
async function getActiveAuctions() {
  const keys = await client.keys('auction:*')
  if (!keys.length) return []

  const results = []
  for (const key of keys) {
    const data = await client.hgetall(key)

    //only include auctions that are still running
    if (data?.status === 'In-Progress') {
      const id = key.split(':')[1]  //extract id from key name
      results.push({ id, ...data, top_bid: parseFloat(data.top_bid) || 0 })
    }
  }
  return results
}

//remove an auction from the cache when it finishes
//so after auction status changes to finished in postgres
async function deleteAuction(id) {
  await client.del(`auction:${id}`)
}

//export all functions so they can be used
export { setAuction, getAuction, getTopBid, setTopBid, getActiveAuctions, deleteAuction }