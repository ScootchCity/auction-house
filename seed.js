import client from './postgres/client.js'

await client.query(`
  INSERT INTO accounts (email, username, password)
  VALUES
    ('calvin.dibartolo@mymail.champlain.edu', 'cdibartolo05', 'Password123'),
    ('ashish.subedi@mymail.champlain.edu', 'asheesh8', 'Password456'),
    ('lloyd.ivester@mymail.champlain.edu', 'ScootchCity', 'Password789'),
    ('logan.donaghue@mymail.champlain.edu', 'Loganest2110', 'Password0!?')
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