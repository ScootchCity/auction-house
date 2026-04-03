// This file contains the functions for reading or writing to accounts table in the postgres DB.
import client from './client.js'


//TODO: figure out node OR learn Drizzle for handling db here

// verify_login: queries db to check for any accounts with the matching name-pw combo.
// Should return true if found, false if not.
// In theory, this could  be dual purpose, being used to verify that a username and password exist when logging in,
// or that they do not yet exist when registering a new account.
async function verify_login(identifier, password) {
  const result = await client.query(
    `SELECT id FROM accounts
     WHERE (email = $1 OR username = $1) AND password = $2`,
    [identifier, password]
  )
  return result.rowCount > 0
}

// Similar to verify_login above, will check db to see if this email has been used alreadu or not.
function verify_unique_email() {

}

// Once everything has been verified, this function will write all of the account info to the db.
function write_login() {

}

//put functions here so they can be used when the postgres index is imported
export {verify_login}