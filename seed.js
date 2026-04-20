import client from './postgres/client.js'
import hash_salt from './postgres/client.js'

// Seed passwords:
// Password123
// Password456
// Password789
// Password0!?

await client.query(`
  INSERT INTO accounts (email, username, password)
  VALUES
    ('calvin.dibartolo@mymail.champlain.edu', 'cdibartolo05', 'b6e28cdced87d18b3cfd35534251e6bf77234848e70c3fc622a1b0a0b5cacac9'),
    ('ashish.subedi@mymail.champlain.edu', 'asheesh8', '6217f6c0fc314ead884a6bdba65a776c0aae5f8d8efd6f19bbf1eaa709189cfa'),
    ('lloyd.ivester@mymail.champlain.edu', 'ScootchCity', 'b365de03fb81795573e4f9de60e53af894df858ba44c82cb4a302d9ec2beb5b9'),
    ('logan.donaghue@mymail.champlain.edu', 'Loganest2110', '768b3083b45077cb63e0ef68cf91e4d03ae85f8f1eb89290bbfc376d168e814e')
  ON CONFLICT DO NOTHING
`)

//seed active auctions - each sold by one of our accounts
//ON CONFLICT DO NOTHING - prevents duplicate inserts if seed is run more than once
await client.query(`
  INSERT INTO auctions (seller, item_name, description, status)
  VALUES
    ((SELECT id FROM accounts WHERE email = 'calvin.dibartolo@mymail.champlain.edu'), '2015 Honda Civic', 'Good condition, mostly spare parts', 'In-Progress'),
    ((SELECT id FROM accounts WHERE email = 'ashish.subedi@mymail.champlain.edu'), 'House of the Dead Original Arcade Machine', 'Heavily used, one light-gun broken', 'In-Progress'),
    ((SELECT id FROM accounts WHERE email = 'lloyd.ivester@mymail.champlain.edu'), 'Orange Game Cube', NULL, 'In-Progress')
  ON CONFLICT DO NOTHING
`)

console.log('postgres seeded')
process.exit(0)