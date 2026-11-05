# Imboni News

A professional full-stack multimedia news platform for Rwanda, built with the MERN stack.

## Project Structure

```
IMBONI-NEWS/
├── client/   — Public news website (React + Vite + Tailwind)
├── admin/    — Private CMS dashboard (React + Vite + Tailwind)
├── server/   — Backend API (Node.js + Express + MongoDB)
└── docs/     — Documentation
```

## Features

- Public news reading, video, audio — no login required
- Imboni TV: video news, short clips, live TV
- Reader accounts: bookmarks, followed topics and followed journalists
- Full CMS: journalists, editors, photographers, video editors
- Advertisement management with banners, campaigns, invoices
- District-based news (Rwanda provinces)
- Kinyarwanda and English support
- Fact-check article tagging and editorial review workflows

## Tech Stack

| Layer    | Technology                        |
|----------|-----------------------------------|
| Frontend | React 18, Vite, Tailwind CSS      |
| Backend  | Node.js, Express.js               |
| Database | MongoDB + Mongoose                |
| Media    | Local uploads in development; persistent object storage required for production |
| Auth     | JWT + bcrypt                      |

## Getting Started

### 1. Server
```bash
cd server
npm install
cp .env.example .env
# Fill in your .env values
npm run dev
```

### 2. Client (Public Website)
```bash
cd client
npm install
npm run dev
```

### 3. Admin (CMS)
```bash
cd admin
npm install
npm run dev
```

## Ports

| App    | Port |
|--------|------|
| Server | 8000 |
| Client | 5173 |
| Admin  | 5174 |


## Local setup (server, public client and admin)

1. Install Node.js LTS and MongoDB (or configure a MongoDB connection string).
2. In `server`, copy `.env.example` to `.env` and set `MONGO_URI`, a random `JWT_SECRET` of at least 32 characters, `CLIENT_URL`, `ADMIN_URL`, and `SERVER_URL`.
3. Run `npm ci` and then `npm run dev` in `server`.
4. Run `npm ci` and `npm run dev` in `client` and `admin` in separate terminals.
5. Configure each Vite app's `VITE_API_URL` if the API is not proxied at `/api`.

Production builds: run `npm ci && npm run build` separately in `client` and `admin`.

### Production security note

Never commit `.env`, database credentials, JWT secrets, or uploaded runtime media. Set production CORS origins explicitly. Use HTTPS, a managed/persistent media store, database backups, and a monitored process manager before launch. The application source must still be integration-tested against a staging database before production deployment.


### Media storage note

The current upload middleware stores files on the API server under `server/public/uploads`. The Cloudinary configuration file is present but is not currently connected to the upload flow. For production, connect Cloudinary or another persistent object-storage provider before deploying to ephemeral hosting.

### Create the first super-admin account

After setting `ADMIN_NAME`, `ADMIN_EMAIL`, and a unique `ADMIN_PASSWORD` (at least 12 characters) in `server/.env`, run:

```bash
cd server
npm run seed
```

The seed script will not print the password. If an account with that email already exists, it will not overwrite its password.

See `docs/PROJECT_AUDIT_AND_REPAIR_REPORT.md` for the repair summary, verification scope and items that must still be completed before production deployment.