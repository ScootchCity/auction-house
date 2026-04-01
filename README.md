# Auction House — Backend Setup

## Prerequisites

Each team member needs these installed:

| Tool | Download |
|------|----------|
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | Runs all the databases |
| [Node.js LTS](https://nodejs.org/) | Runs your JavaScript code |

---

## First-time setup

1. **Clone the repo** and open a terminal in the project folder.

2. **Install JS dependencies:**
   ```bash
   npm install
   ```

4. **Start all databases:**
   ```bash
   docker compose up -d
   ```
   The `-d` flag runs them in the background. First run will download the images (~a few minutes).

5. **Verify everything is running:**
   ```bash
   docker compose ps
   ```
   All services should show `running`.

---

## Services & ports

| Service | Port | Purpose |
|---------|------|---------|
| PostgreSQL | `5432` | Relational database |
| MongoDB | `27017` | Document database |
| Redis | `6379` | In-memory key/value store |
| Kafka | `9092` | Message broker |

## UI Dashboards (open in browser)

| Dashboard | URL | Login |
|-----------|-----|-------|
| pgAdmin (Postgres) | http://localhost:5050 | `admin@admin.com` / `admin` |
| Mongo Express | http://localhost:8082 | none |
| Redis Commander | http://localhost:8081 | none |
| Kafka UI | http://localhost:8083 | none |

> **pgAdmin first login:** After signing in, you need to add a server manually.
> Right-click Servers → Register → Server.
> - Name: `auction-house`
> - Host: `postgres`  (not localhost — Docker uses the service name)
> - Port: `5432`
> - Username: `admin`
> - Password: `admin`

---

## Daily workflow

```bash
# Start databases (do this before running your code)
docker compose up -d

# Stop databases (end of day — data is saved)
docker compose stop

# Full stop + remove containers (data still saved in volumes)
docker compose down

# Wipe ALL data and start fresh
docker compose down -v
```

---

## Connecting from JavaScript

```js
// PostgreSQL
import pg from 'pg';
const client = new pg.Client({
  host: 'localhost', port: 5432,
  user: 'admin', password: 'admin', database: 'auction_house'
});

// MongoDB
import mongoose from 'mongoose';
await mongoose.connect('mongodb://admin:admin@localhost:27017/auction_house?authSource=admin');

// Redis
import Redis from 'ioredis';
const redis = new Redis({ host: 'localhost', port: 6379 });

// Kafka
import { Kafka } from 'kafkajs';
const kafka = new Kafka({ clientId: 'auction-app', brokers: ['localhost:9092'] });
```

---

## Troubleshooting

- **Docker not starting** — make sure Docker Desktop is open and running before running `docker compose` commands.
- **Containers keep restarting** — run `docker compose logs <service-name>` to see the error (e.g. `docker compose logs kafka`).
