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
- Reader accounts: bookmarks, personalized feed, comments
- Full CMS: journalists, editors, photographers, video editors
- Advertisement management with banners, campaigns, invoices
- District-based news (Rwanda provinces)
- Kinyarwanda and English support
- AI summaries and fact-checking

## Tech Stack

| Layer    | Technology                        |
|----------|-----------------------------------|
| Frontend | React 18, Vite, Tailwind CSS      |
| Backend  | Node.js, Express.js               |
| Database | MongoDB + Mongoose                |
| Media    | Cloudinary                        |
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
