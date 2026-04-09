// Docs: https://node-postgres.com/

import pg from 'pg'
import 'dotenv/config'

const { Pool } = pg

const client = new Pool({
  host: 'localhost',
  port: 5432,
  user: "admin", //process.env.POSTGRES_USER,
  password: "admin", //process.env.POSTGRES_PASSWORD,
  database: "auction_house",
})

export default client
