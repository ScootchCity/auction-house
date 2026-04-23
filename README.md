# Auction House — CSI-300 Final Project

A multi-database auction platform built with PostgreSQL, MongoDB, Redis, and Kafka.

---

## Stack

| Service | Role |
|---------|------|
| **App** | Express web server — serves pages, handles sessions, routes requests |
| **PostgreSQL** | Source of truth for users, auctions, and bids |
| **MongoDB** | Document store for rich auction data (item info, images, descriptions) |
| **Redis** | Caches active auctions and top bids for fast reads; stores chat messages and sessions |
| **Kafka** | Message queue for bid processing — bids are validated, queued, then written async |
| **Seeder** | Runs once at startup to create tables and insert seed data, then exits |

---

## Features

- Register / login with hashed passwords
- Create auctions with item name, description, duration, and an optional image
- Live top bid polling — updates every 5 seconds without a page reload
- Bid history on every auction page
- Bidder chat — Redis-backed live chat per auction, restricted to users who have placed a bid
- User profile showing auctions you're currently winning and auctions you've won
- Auction expiry — scheduled automatically on startup, auctions close themselves at end_date
- `/redis` monitor page — live view of the Redis cache with TTLs, auto-refreshes every 5 seconds
- `/dev` page — force-close any active auction for demo purposes (hidden, click the dot 5 times on the auctions page)

---

## Bid flow

1. User submits a bid → validated against Redis cache → sent to Kafka topic `bids`
2. Kafka consumer (`kafka/bidProcessor.js`) picks it up → re-validates → writes to Postgres → updates Redis top bid
3. Auction page polls `/auctions/:id/top_bid` every 5 seconds and updates live

---

## Auction expiry

On startup, the app schedules a `setTimeout` for every active auction based on its `end_date`. When the timer fires, the auction is marked `Finished` in Postgres and removed from Redis. The `/dev` page lets you trigger this manually for demos.

---

## Setup

### Prerequisites

| Tool | Purpose |
|------|---------|
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | Runs all services |
| [Node.js LTS](https://nodejs.org/) | Only needed for local development outside Docker |

### First time

```bash
npm install
docker compose up -d --build
```

That's it. The seeder runs automatically and sets everything up.

### After changing JS files

```bash
docker compose up -d --build
```

### Wipe all data and start fresh

```bash
docker compose down -v
docker compose up -d --build
```

---

## Services & ports

| Service | URL | Purpose |
|---------|-----|---------|
| **App** | http://localhost:3000 | Web GUI |
| pgAdmin | http://localhost:5050 | Postgres UI |
| Adminer | http://localhost:8084 | Postgres UI (lightweight) |
| Mongo Express | http://localhost:8082 | MongoDB UI |
| Redis Commander | http://localhost:8081 | Redis UI |
| Kafka UI | http://localhost:8083 | Kafka UI |

> **pgAdmin first login:** Right-click Servers → Register → Server.
> Host: `postgres`, Port: `5432`, credentials from `.env`

---

## Seed accounts

| Email | Username | Password |
|-------|----------|----------|
| calvin.dibartolo@mymail.champlain.edu | cdibartolo05 | calvin |
| ashish.subedi@mymail.champlain.edu | asheesh8 | ashish |
| lloyd.ivester@mymail.champlain.edu | ScootchCity | lloyd |
| logan.donaghue@mymail.champlain.edu | Loganest2110 | logan |

---

## .env

Credentials are stored in `.env` at the project root. These are dev-only defaults — do not use in production.
