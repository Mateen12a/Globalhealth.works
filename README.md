# Global Health Works

Global Health Works is a marketplace platform connecting global health problems with global health solutions. Users can post tasks or work on tasks in the global health domain. Live at [globalhealth.works](https://globalhealth.works).

## Project Structure
- **frontend/**: React 19 + Vite 7 application with Tailwind CSS 4 and Framer Motion
  - Dev port: 5000
  - Socket.io client for real-time messaging
- **backend/**: Express.js API server
  - Port: 3000
  - MongoDB database (Mongoose ORM)
  - Socket.io for real-time features, JWT authentication, file uploads with Multer
- **games/recruitment-office/**: The Recruitment Office — a standalone narrative browser game about health workforce migration. Staged into the frontend build and served at `/recruitment-office/`.

## Technology Stack
- **Frontend**: React 19, Vite 7, Tailwind CSS 4, Framer Motion
- **Backend**: Express 5, Mongoose 8, Socket.io
- **Database**: MongoDB (external)
- **Authentication**: JWT tokens

## Environment Variables Required
- `MONGO_URI`: MongoDB connection string (required)
- `RESEND_API_KEY`: Resend API key for email functionality (optional)
- `JWT_SECRET`: Secret for JWT tokens (required)
- `VITE_API_URL`: Frontend API URL
- `ALLOWED_ORIGINS`: Comma-separated list of allowed CORS origins

## Running the Project
- Frontend: `cd frontend && npm run dev` (port 5000)
- Backend: `cd backend && npm start` (port 3000)

## Deployment
- Build frontend: `cd frontend && npm run build`
- Production: Backend serves the frontend build from `frontend/dist`
- The game ships automatically: `prebuild` copies `games/recruitment-office/` into `frontend/public/`, and `vite build` includes it in `dist/`

## Production Security Features
- **Rate Limiting**: 100 requests/15min per IP (general), 20 requests/15min (auth endpoints)
- **Security Headers**: Helmet middleware for XSS protection, HSTS, etc.
- **CORS**: Origin allowlist with credentials support (globalhealth.works)
- **Compression**: gzip compression for responses
- **Global Error Handler**: Catches unhandled errors gracefully
- **Request Size Limit**: 10MB max body size
- **Database Indexes**: Optimized for Message, Task, and Conversation queries

## Real-time Features
- Socket.io for messaging and notifications
- Message notifications with 15-minute cooldown to prevent spam
- Optimistic UI updates for chat (sender-side)
