# e-Prokurimi Tracker

Monorepo for tracking public procurement notices from Kosovo's e-Prokurimi portal.

## Prerequisites

- Docker Desktop
- Python 3.11+
- Node.js 20+
- npm

## Start PostgreSQL

```bash
docker compose up -d postgres
```

The database is available at `localhost:5432` with database `eprokurimi`, user `eprokurimi`, and password `eprokurimi`.

## Scraper

Copy `scraper/.env.example` to `scraper/.env`, then run the complete live
fetch, parse, and database sync pipeline:

```powershell
cd scraper
\.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python run_scrape.py
```

To also save the live responses as `page1.html` through `page10.html`:

```powershell
python run_scrape.py --save-html
```

## API

```bash
cd api
npm install
npm run db:migrate
npm run dev
```

The API health check is available at `http://localhost:3001/health`.

## Web

```bash
cd web
npm install
npm run dev
```

The frontend is available at `http://localhost:3000`.

## Environment

The API defaults to the local Docker database. To override it, create `api/.env`:

```env
DATABASE_URL=postgres://eprokurimi:eprokurimi@localhost:5432/eprokurimi
PORT=3001
```
