# Eventora

A full-stack event discovery and booking platform. Browse events, book a spot with OTP-verified email confirmation, and manage everything from an admin dashboard.

**Live site:** https://client-eventora-tejash.vercel.app

| Role | Email | Password |
|---|---|---|
| Admin | `admin@eventora.com` | `password123` |
| User | `user@eventora.com` | `password123` |

## Features

- Browse, search, and filter events by category
- OTP-verified booking flow (email confirmation before a booking is submitted)
- Admin dashboard — create/edit/delete events, confirm or reject booking requests, search and filter across events and bookings
- User dashboard — view and cancel your own bookings
- Custom toast notifications and confirm dialogs (no native browser alerts)

## Tech Stack

- **Client:** React (Vite), Tailwind CSS, React Router
- **Server:** Express, Mongoose (MongoDB), JWT auth, Nodemailer (OTP emails)

## Project Structure

```
client/   React frontend (Vite)
server/   Express API + MongoDB models
```

## Local Development

### Server

```bash
cd server
npm install
cp .env.example .env   # fill in the values below
npm run dev
```

Required environment variables in `server/.env`:

| Variable | Purpose |
|---|---|
| `PORT` | Port the API listens on (defaults to 5000) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign auth tokens |
| `EMAIL_USER` | Gmail address used to send OTP emails |
| `EMAIL_PASS` | Gmail app password (not your regular password) |

Optional: seed the database with sample users, events, and bookings:

```bash
node utils/seed.js
```

### Client

```bash
cd client
npm install
npm run dev
```

By default the client talks to `http://localhost:5000/api`. To point it at a different backend, set `VITE_API_URL` (e.g. in `client/.env.local`).

## Deployment

Both `client/` and `server/` are deployed independently to Vercel.

- **Server** runs as a Vercel serverless function (Express app exported via `module.exports = app`, routed through `server/vercel.json`). Needs `MONGODB_URI`, `JWT_SECRET`, `EMAIL_USER`, and `EMAIL_PASS` set as Vercel environment variables.
- **Client** is a static Vite build. `client/vercel.json` adds a rewrite so client-side routes (`/login`, `/admin`, etc.) resolve correctly instead of 404ing on direct navigation. Needs `VITE_API_URL` set to the deployed server's URL (e.g. `https://server-eventora-tejash.vercel.app/api`).

To redeploy either project:

```bash
cd client   # or server
vercel deploy --prod
```
