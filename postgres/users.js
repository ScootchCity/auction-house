// This file contains the functions for reading or writing to accounts table in the postgres DB.
import client from './client.js'
import { createHash } from 'node:crypto';


function hash_salt(password) {
  password += 'diamond'; // appends hash phrase, change as needed
  return createHash('sha256').update(password).digest('hex');
}

//TODO: look into drizzle or figure out other way to ensure query security with functions

// verify_login: queries db to check for any accounts with the matching name-pw combo.
// Should return true if found, false if not.
// In theory, this could  be dual purpose, being used to verify that a username and password exist when logging in,
// or that they do not yet exist when registering a new account.
async function verify_login(identifier, password) {
  const result = await client.query(
    `SELECT id, username FROM accounts
     WHERE (email = $1 OR username = $1) AND password = $2`,
    [identifier, password]
  )
  return result.rows[0] ?? null
}

// Similar to verify_login above, will check db to see if this email has been used alreadu or not.
async function verify_unique_email(email) {
  const result = await client.query (
    'SELECT id, username FROM accounts WHERE email = $1',
      [email]
  )
  return result.rowCount > 0
}

// Once everything has been verified, this function will write all of the account info to the db.
// This one still returns a bool like the others, but here it's just to check if the write was successful
// rather than being a key to its use
async function write_login(email, username, password) {
  const result = await client.query (
  'INSERT INTO accounts (email, username, password) VALUES ($1, $2, $3)',
      [email, username, password]
  )
  return result.rowCount > 0
}

//todo: Make function for getting UUID of currently logged-in user

//put functions here so they can be used when the postgres index is imported
export {verify_login}
export {verify_unique_email}
export {write_login}