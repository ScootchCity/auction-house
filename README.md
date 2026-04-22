# Auction House

An auction web app built with Node.js, Express, PostgreSQL, MongoDB, Redis, and Kafka.

---

## Prerequisites

| Tool | Purpose |
|------|---------|
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | Runs the entire app and all services |

---

## Setup

1. **Clone the repo** and open a terminal in the project folder.

2. **Start everything:**
   ```bash
   docker compose up --build -d
   ```
   First run will download images and build the app container.

3. **Open the app:** [http://localhost:3000](http://localhost:3000)

---

## Making changes

- **EJS templates** (`views/`) — changes are reflected immediately on page refresh, no restart needed.
- **JS files** (routes, postgres, kafka, etc.) — restart the app container to pick up changes:
  ```bash
  docker compose restart app
  ```
- **Adding npm packages** — requires a full rebuild:
  ```bash
  docker compose up --build app
  ```

---

## Architecture

The app is split across several services that each handle a specific concern:

| Service | Role |
|---------|------|
| **App** | Express web server — serves pages, handles sessions, routes requests |
| **PostgreSQL** | Source of truth for users, auctions, and bids |
| **MongoDB** | Document store for auction data — will become the primary auction source once it is complete |
| **Redis** | Caches active auctions and top bids for fast reads; stores sessions |
| **Kafka** | Message queue for bid processing — bids are validated, queued, then written to Postgres and Redis asynchronously |
| **Seeder** | Runs once at startup to create tables and insert seed data, then exits. An exited seeder container is normal and expected. |

### Bid flow
1. User submits a bid → validated against Redis cache → sent to Kafka
2. Kafka consumer (`bidProcessor.js`) picks it up → writes to Postgres → updates Redis
3. Auction page polls `/auctions/:id/top_bid` every 5 seconds and updates without a page reload

### Auction expiry
When the app starts, it schedules a `setTimeout` for every active auction based on its `end_date`. When the timer fires, the auction is marked `Finished` in Postgres and removed from the Redis cache.

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

> **pgAdmin first login:** After signing in, add a server manually.
> Right-click Servers → Register → Server.
> - Name: anything
> - Host: `postgres` (not localhost — Docker uses the service name)
> - Port: `5432`
> - Username/Password/Database: from `.env`

---

## Docker commands

```bash
# Start everything (first time or after adding packages)
docker compose up --build -d

# Start without rebuilding
docker compose up -d

# Restart just the app (after changing JS files)
docker compose restart app

# Check service status
docker compose ps

# View logs for a service
docker compose logs app
docker compose logs kafka

# Stop everything (data is preserved)
docker compose down

# Wipe ALL data and start fresh (re-runs seeder on next up)
docker compose down -v
```

---

## .env

Credentials are stored in `.env` at the project root. These are default/dev values — nothing sensitive.

---

## Further reading

See [docs.md](docs.md) for links to each library's documentation.
