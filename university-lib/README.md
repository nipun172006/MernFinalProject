# University Library (MERN)

Multi-tenant university library system with JWT auth in HttpOnly cookies.

## Structure

- `server/` – Express + Mongoose API (default port 5002)
- `client/` – React + Vite (port 3000)

## Prerequisites

- Node.js 18+
- MongoDB running locally or in the cloud

## Setup

1. Server env:
   - Copy `server/.env.example` to `server/.env` and set values.
   - Ensure `JWT_SECRET` is a strong random string.
   - Set `PORT=5002` (5000 may be in use on macOS by a system service).
   - Optionally set `CLIENT_ORIGIN=http://localhost:3000`.

2. Install deps:

```bash
# Server
cd server
npm install

# Client
cd ../client
npm install
```

3. Seed example data (University, Admin, Student, and Books):

```bash
cd server
npm run seed
```

This creates, if missing:
- University: Example University (domain: example.edu)
- Admin: admin@example.edu / Admin@12345
- Student: student@example.edu / Student@12345
- Books: Clean Code, Design Patterns, You Don't Know JS

4. Run apps (development):

```bash
# Terminal 1 (server)
cd server
npm run dev

# Terminal 2 (client)
cd client
npm run dev
```

- Server: http://localhost:5002
- Client: http://localhost:3000

Or build and preview the client against the running API:

```bash
# Build client
cd client
npm run build

# Preview (serves dist/ on 3000)
npm run preview
```

## Auth Flow

- Register: email must match a known `University.domain` (e.g., `user@example.edu`). Registered users are Students by default.
- Login: sets `auth_token` HttpOnly cookie (SameSite=Lax).
- Logout: clears cookie.
- Status: `GET /api/auth/status` returns `{ id, role, universityRef }` when authenticated.

## Onboarding Flow (Create a University + Admin)

- `POST /api/onboarding/university-register`
   - Body: `{ universityName, domain, adminEmail, adminPassword }`
   - Rules: `adminEmail` domain must match `domain` (e.g., admin@myuni.edu and domain=myuni.edu)
   - On success: creates the University and an Admin user; sets HttpOnly cookie and signs in the Admin.
   - Client route: `/onboarding` offers a simple wizard to register your university.

## API Summary

- `POST /api/auth/register` – Create Student (email domain must match a University)
- `POST /api/auth/login` – Login and set cookie
- `POST /api/auth/logout` – Clear cookie
- `GET  /api/auth/status` – Current session
- `GET  /api/admin/books` – [Admin] List inventory for admin's university
- `POST /api/admin/books` – [Admin] Add a new book (auto-links to admin's university)
- `GET  /api/student/books/available` – [Student] Books with available copies now
- `GET  /api/student/books/predictions` – [Student] Soonest due date per book
- `POST /api/loans/checkout` – Borrow a copy (7-day due)
- `POST /api/loans/return/:loanId` – Return a loan
- `GET  /api/loans/mine` – Current user's loans
 - `POST /api/onboarding/university-register` – Public endpoint to create a University and first Admin

## Notes

- CORS allows `http://localhost:3000` with `credentials: true` (configurable via `CLIENT_ORIGIN`).
- Axios is set to `withCredentials = true` and `baseURL` via `client/.env.*`.
   - Development: `client/.env.development` → `VITE_API_BASE_URL=http://localhost:5002`
   - Production preview: `client/.env.production` → `VITE_API_BASE_URL=http://localhost:5002`
- For Admin users, create a user with `role: 'Admin'` manually or via a seed script and ensure `universityRef` is set.

### Book model fields

- `title` (required), `author`, `ISBN` (required), `coverImageUrl`, `description`, `totalCopies` (required), `borrowCount` (popularity), `availableCopies` (virtual), `activeLoans` (virtual)

Popularity increases when a book is checked out.
