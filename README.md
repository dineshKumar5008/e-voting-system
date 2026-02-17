## Secure E-Voting System

This project is a demo-grade, full-stack, secure E‑Voting platform with:

- **Frontend**: React + Vite, glassmorphism UI
- **Backend**: Node.js, Express, MongoDB (Mongoose)
- **Blockchain layer**: Lightweight custom blockchain storing **hashed, encrypted votes**
- **Auth**: JWT (HTTP header + httpOnly cookie), CSRF token, bcrypt-hashed passwords
- **Bot detection**: Behavioral metrics, IP anomaly heuristics, reCAPTCHA hook

### Running locally

- Backend:
  - `cd backend`
  - `npm install`
  - Create `.env` based on `src/config/env.js` (MONGO_URI, JWT_SECRET, ENCRYPTION_KEY, RECAPTCHA_SECRET, etc.)
  - `npm run dev`
- Frontend:
  - `cd frontend`
  - `npm install`
  - Optionally set `VITE_RECAPTCHA_SITE_KEY` in `.env`
  - `npm run dev`

The backend listens on `http://localhost:5000`, frontend on `http://localhost:5173`.

### High-level security design

- **Registration & login**
  - Passwords are **bcrypt-hashed** (`User` model `pre('save')` hook).
  - Email and `uniqueId` are **unique indexed fields** to prevent duplicate registrations.
  - JWT is signed with `JWT_SECRET` and sent both as a **Bearer token** and **httpOnly cookie**.

- **Bot detection**
  - Frontend sends **behavioral metrics** (`mouseMoves`, `timeToCompleteMs`) via `BotBehaviorTracker` for login and voting.
  - Backend `botDetection` middleware scores behaviour + **IP-based anomaly** (frequency) and optional **reCAPTCHA** verification.
  - If suspicion score **exceeds threshold**, login/vote is blocked with HTTP 403.

- **Voting & anonymity**
  - A user can vote **once only** (`hasVoted` flag on `User`, enforced in `/api/vote` route).
  - Vote payload (e.g., candidate ID + salt) is encrypted with **AES‑256‑GCM** (`encryptVote` in `utils/crypto.js`).
  - A **pseudonymous fingerprint** (`makeVoterFingerprint`) is derived from user id and a secret key; this lets the system detect double voting **without storing raw user id** in the vote document.
  - A **SHA‑256 hash** over `(encryptedVote + voterFingerprint)` is stored in both MongoDB (`Vote.voteHash`) and on-chain (`Block.voteHash`).
  - No plaintext candidate choice or direct user identity is ever stored on the blockchain.

- **Blockchain integrity**
  - Custom `Blockchain` class manages an append-only chain of `Block` documents.
  - Each block stores: `index`, `timestamp`, `voteHash`, `previousHash`, `hash`.
  - `hash` is computed from all of the above (`_calculateHash`); tampering any field breaks the chain.
  - `/api/blockchain/verify` recomputes hashes and previous links for **proof-of-integrity**.

- **Transparency**
  - Public `/api/vote/stats` and `Dashboard` page show **aggregate total votes only**.
  - `AdminPanel` (admin JWT required) shows registered voters, turnout, and blockchain validity.

- **OWASP-aligned protections**
  - **Injection (NoSQL)**: `express-mongo-sanitize` strips `$` / `.` from inputs; Mongoose queries use structured filters.
  - **XSS**: `xss-clean`, `helmet` (sensible headers), React escapes content by default.
  - **CSRF**: `csurf` issues a CSRF cookie; SPA sends `X-CSRF-Token` header on every `POST`/`PUT`/`DELETE`.
  - **Auth & session flaws**: Strong bcrypt hashing, JWT expiry, role-based authorization (`requireAdmin`), `hasVoted` enforcement.
  - **Rate limiting & brute force**: `express-rate-limit` on `/api/auth` and `/api/vote`.
  - **Security headers**: `helmet` (HSTS, no-sniff, frameguard, etc.), strict CORS whitelist.
  - **Privilege escalation**: Admin-only routes are guarded by `authRequired` + `requireAdmin`.
  - **Logging**: `morgan` for request logs; errors are centralized in `errorHandler`.

> **Note**: This is a teaching/demo implementation. For production-scale elections, you would harden key management, move IP and bot metrics to Redis, add hardware security modules, and have independent third-party audits.


