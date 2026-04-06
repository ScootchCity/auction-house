-- Example data for proof of concept

-- Account data
INSERT INTO accounts (email, username, password)
VALUES
    ('calvin.dibartolo@mymail.champlain.edu', 'cdibartolo05', 'Password123'),
    ('ashish.subedi@mymail.champlain.edu', 'asheesh8', 'Password456'),
    ('lloyd.ivester@mymail.champlain.edu', 'ScootchCity', 'Password789'),
    ('logan.donaghue@mymail.champlain.edu', 'Loganest2110', 'Password0!?');

--Auctions in progress (Will later add a few past auctions with manually-entered dates)
INSERT INTO auctions (seller, item_name, description, status)
VALUES
    ((SELECT id FROM accounts WHERE email = 'calvin.dibartolo@mymail.champlain.edu'), '2015 Honda Civic', 'Good condition, mostly spare parts', 'In-Progress'),
    ((SELECT id FROM accounts WHERE email = 'ashish.subedi@mymail.champlain.edu'), 'House of the Dead Original Arcade Machine', 'Heavily used, one light-gun broken', 'In-Progress'),
    ((SELECT id FROM accounts WHERE email = 'lloyd.ivester@mymail.champlain.edu'), 'Orange Game Cube', NULL, 'In-Progress');

--Completed Auctions 
INSERT INTO auctions (seller, item_name, description, status, created_at)
VALUES
    ((SELECT id FROM accounts WHERE email = 'logan.donaghue@mymail.champlain.edu'), '2012 Chevy Silverado', 'Good condition, 120k miles, swapped engine at 75k miles', 'Finished', NOW() - INTERVAL '7 days');

-- INSERT INTO bids (auction_id, account_id, amount, top_bid)
-- VALUES
--     ((SELECT FROM auctions WHERE item_name = '2015 Honda Civic'), (SELECT FROM accounts WHERE email = 'logan.donaghue@mymail.champlain.edu'), 9700.00, )

-- DEPRECATED DATA, BEING KEPT FOR REFERENCE
-- INSERT INTO items (item_name, description, seller, sold_to)
-- VALUES
--     ('2012 Chevy Silverado', 'Good condition, 120k miles, swapped engine at 75k miles', (SELECT id FROM accounts WHERE email = 'calvin.dibartolo@mymail.champlain.edu'), (SELECT id FROM accounts WHERE email = 'logan.donaghue@mymail.champlain.edu')),
--     ('House of the Dead Original Arcade Machine', NULL, (SELECT id FROM accounts WHERE email = 'ashish.subedi@mymail.champlain.edu'), NULL),
--     ('Orange Game Cube', NULL, (SELECT id FROM accounts WHERE email = 'lloyd.ivester@mymail.champlain.edu'), NULL);
--
-- INSERT INTO auctions (item_id, status)
-- VALUES
--     ((SELECT id FROM items WHERE item_name = '2012 Chevy Silverado'), 'Finished'),
--     ((SELECT id FROM items WHERE item_name = 'House of the Dead Original Arcade Machine'), 'In-Progress'),
--     ((SELECT id FROM items WHERE item_name = 'Orange Game Cube'), 'In-Progress');

