# Painita Loans

Full-stack app: React (Vite) client + Express + PostgreSQL backend.

## Local development

- Backend
  - env: create `server/.env` with DATABASE_URL, Twilio keys, etc.
  - run:
    - `npm run dev` in `server`
- Frontend
  - run:
    - `npm run dev` in `client`

Uploads are served from `http://localhost:5000/uploads/...`.

## Build client

- `cd client && npm ci && npm run build`

## Deploy to Render

- Repo must include this file: `render.yaml`
- Render will build the client and install server deps
- Service type: Web, Root dir: `server`
- Start command: `node index.js`
- Disk storage mounted at `/opt/render/project/src/server/uploads`
- Configure env vars in Render dashboard:
  - DATABASE_URL
  - TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE
  - UPLOADS_DIR (defaults to disk mount path)

Routes:
- API: `/api/...`
- Static uploads: `/uploads/<filename>`
- Frontend: served from `client/dist` in production (SPA fallback)