// Docs: https://node-postgres.com/

import pg from 'pg'
import 'dotenv/config'

const { Pool } = pg

const client = new Pool({
  host: 'localhost',
  port: 5432,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
})

export default client
