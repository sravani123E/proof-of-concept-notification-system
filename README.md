## Insyd Notifications POC

This workspace contains two apps:

- `backend/`: Node.js + Express + MongoDB (Mongoose)
- `frontend/`: React + Vite

### Backend (Node + Express + MongoDB)

Local dev:

1. Create `.env` in `backend/`:
```
PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/insyd_notifications_poc
```
2. Install deps and run:
```
cd backend
npm install
npm run dev
```
The server seeds 3 users (alice, bob, charlie) on first run and logs their ids.

API:
- `POST /events` body: `{ type: 'like'|'follow'|'comment', actorId, targetUserId, metadata? }`
- `GET /notifications/:userId`

Deploy (Render / Railway):
- Set `MONGO_URI` in environment. Start command: `node src/index.js`.

### Frontend (React + Vite)

Local dev:
```
cd frontend
npm install
npm run dev
```
Set `VITE_BACKEND_URL` in a `.env` file at `frontend/` root to point to your backend.

Deploy (Vercel / Netlify):
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_BACKEND_URL`

