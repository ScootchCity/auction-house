import { auctionsExport, bidsExport } from "./schema.js"
//import { seed_database } from './items.js'

async function get_active_auctions() {
    const activeAuctions = await auctionsExport.find({ active: true }).sort({ end_date: 1 }).limit(10)
    return activeAuctions
}

export { get_active_auctions }

export async function get_auction(auctionId) {
    const auction = (await auctionsExport.findOne({auction_id: auctionId}))
    return auction;
}

export async function create_auction(auctionInformation) {
    const auction = new auctionsExport({
        auction_id: auctionInformation.auctionId,
        seller_id: auctionInformation.sellerUUID,
        item: auctionInformation.item,
        description: auctionInformation.description,
        image_url: auctionInformation.image_url || null,
        start_date: new Date(),
        end_date: auctionInformation.endDate,
        active: true
    })

    return await auction.save()
}