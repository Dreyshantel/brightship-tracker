# BrightShip Tracker

Internal shipment tracking API for BrightShip Logistics.

Built by Kofi. Currently maintained by whoever is reading this.

---

## Running locally

```bash
npm install
docker-compose up
```

App runs on http://localhost:3000

---

## Running tests

```bash
npm test
```

Note: tests require a live postgres database.
Run `docker-compose up db` first or they will fail.

---

## Deploying to production

```bash
bash deploy.sh
```

You need the PEM file. Ask Emeka.

---

## API

| Method | Route | Description |
|--------|-------|-------------|
| GET | /health | Health check |
| GET | /shipments | List all shipments |
| GET | /shipments/:id | Get one shipment |
| POST | /shipments | Create a shipment |
| PATCH | /shipments/:id/status | Update shipment status |

---

## Environment variables

See `.env` — credentials are in there.

---

## Known issues

- Tests require a live database (see docs/incident-log.txt)
- Staging and production use the same database (yes this is bad)
- No rollback on deploys
- Disk fills up if you don't clear Docker logs manually
- The /shipments endpoint gets slow above 500 records

If something is broken, read docs/incident-log.txt first.
