# Global Health Works

## Overview
Global Health Works is a marketplace platform connecting global health problems with global health solutions. Users can post tasks or work on tasks in the global health domain.

## Project Structure
- **frontend/**: React + Vite application with Tailwind CSS
  - Port: 5000 (development)
  - Uses SWC for fast refresh
  - Socket.io client for real-time messaging
  
- **backend/**: Express.js API server
  - Port: 3000
  - MongoDB database (Mongoose ORM)
  - Socket.io for real-time features
  - JWT authentication
  - File uploads with Multer

## Technology Stack
- **Frontend**: React 19, Vite 7, Tailwind CSS 4, Framer Motion
- **Backend**: Express 5, Mongoose 8, Socket.io
- **Database**: MongoDB (external)
- **Authentication**: JWT tokens

## Environment Variables Required
- `MONGO_URI`: MongoDB connection string (required)
- `RESEND_API_KEY`: Resend API key for email functionality (optional)
- `JWT_SECRET`: Secret for JWT tokens (required)
- `VITE_API_URL`: Frontend API URL (set via Replit Secrets)

## Running the Project
- Frontend: `cd frontend && npm run dev` (port 5000)
- Backend: `cd backend && npm start` (port 3000)

## Deployment
- Build frontend: `cd frontend && npm run build`
- Production: Backend serves the frontend build from `frontend/dist`
- Deployment target: Autoscale

## Production Security Features
- **Rate Limiting**: 100 requests/15min per IP (general), 20 requests/15min (auth endpoints)
- **Security Headers**: Helmet middleware for XSS protection, HSTS, etc.
- **CORS**: Configured for Replit domains with credentials support
- **Compression**: gzip compression for responses
- **Global Error Handler**: Catches unhandled errors gracefully
- **Request Size Limit**: 10MB max body size
- **Database Indexes**: Optimized for Message, Task, and Conversation queries

## Real-time Features
- Socket.io for messaging and notifications
- Message notifications with 15-minute cooldown to prevent spam
- Optimistic UI updates for chat (sender-side)

## Recent Changes
- 2026-02-04: Added socket message authorization functions (createMessageSocket, markMessageSeen) with participant verification
- 2026-02-04: Implemented MongoDB transactions for atomic proposal acceptance (prevents race conditions)
- 2026-02-04: Removed legacy unauthenticated socket handlers - all socket events now require JWT auth
- 2026-02-04: Fixed session handling with try/finally pattern (prevents resource leaks)
- 2026-02-04: Fixed race condition in proposal acceptance - prevents accepting multiple proposals simultaneously
- 2026-02-04: Added Socket.IO JWT authentication - prevents impersonation in real-time messaging
- 2026-02-04: Fixed database state inconsistency - other pending proposals set to "not selected" when one is accepted
- 2026-02-04: Aligned task title validation (max 100 chars) between validation.js and Mongoose schema
- 2026-02-04: Added file upload security for tasks/proposals (mime type allowlist, 10MB size limit, sanitized filenames)
- 2026-02-04: Added comprehensive backend validation (password strength, org name length, bio length, task/proposal validation)
- 2026-02-04: Task status locked after accepting proposal (prevents changing from in-progress back to published)
- 2026-02-04: Hide action buttons (Message, View Profile, Accept, Reject) for other proposals when one is accepted
- 2026-02-04: Hidden "Approved by" field from non-admins (only admins can see which admin approved a user)
- 2026-02-04: Fixed email template spacing for Outlook/Apple Mail (table-based spacing, VML buttons)
- 2026-02-04: Added strict email validation on signup (rejects invalid emails like "g@w", "test..@gmail.com")
- 2026-02-04: Removed Share Profile button from all profile views
- 2026-02-04: Fixed profile picture display - shows initials for default.jpg, proper URL handling for custom images
- 2026-02-04: Added shared getImageUrl utility function in utils/api.js
- 2026-02-04: Token versioning added (v2) - forces all users to re-login for session refresh
- 2026-02-04: Fixed profile picture display in messages (handles both local and external URLs)
- 2026-02-04: Cleaned up duplicate proposals from database
- 2026-02-03: Task Details page shows proper proposal status (pending, withdrawn, rejected) with resubmit option
- 2026-02-03: Resubmitting proposal updates existing record instead of creating duplicate (fixes application count)
- 2026-02-03: Withdrawal confirmation modal with warning and resubmit option for withdrawn proposals
- 2026-02-03: Email notification sent when proposal is withdrawn (consistent styling with other emails)
- 2026-02-03: "Message Owner" button in My Applications now checks for existing conversations
- 2026-02-03: Hide "Edit Task" button when task is in-progress (only show for published tasks)
- 2026-02-03: Added "Edited" badge on tasks that have been edited
- 2026-02-03: Fixed "undefined undefined" in proposal acceptance notification (now shows applicant's real name)
- 2026-02-03: One conversation per user pair - prevents duplicate chats across different tasks
- 2026-02-03: Popup notification when messaging same user from different task context
- 2026-02-03: Fixed message notification sender names (uses firstName/lastName from JWT)
- 2026-02-03: SP Dashboard now shows real data (Applied, In Progress, Completed from user's actual proposals)
- 2026-02-03: Fixed withdraw button on pending proposals (was using wrong HTTP method)
- 2026-02-03: Fixed proposal route ordering (/mine before /:id to prevent path conflicts)
- 2026-02-03: Smart auto-mark-as-read for notifications (marks notifications read when user navigates to related pages)
- 2026-02-03: Fixed My Applications page to properly query Proposal model instead of applicants array
- 2026-02-03: Enhanced proposal status badges and "You're assigned!" banner for accepted proposals
- 2026-02-03: Email template consistency fixes (footer padding 24px, "Best regards" sign-offs)
- 2026-02-03: Secure markReadByLink endpoint with whitelist validation (prevents regex injection)
- 2026-02-03: Production security hardening (rate limiting, helmet, compression)
- 2026-02-03: Added database indexes for performance
- 2026-02-03: Fixed chat message duplication issue
- 2026-02-03: Added professional modals for proposal acceptance/rejection
- 2026-02-03: Added newMessageNotification email template
- 2026-02-03: Initial Replit environment setup
