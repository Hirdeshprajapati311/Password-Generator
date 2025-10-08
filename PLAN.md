High-level approach (keep it tiny & private-first)

Frontend: Next.js (TypeScript). All encryption happens in the browser before sending to backend.

Backend: Next.js API routes (Node). Store only encrypted blobs and metadata (title, username, url, encrypted: {ciphertext, iv, salt, tag...}).

Auth: Simple email+password with bcrypt and JSON Web Token in an HttpOnly cookie. (Or NextAuth Credentials — whichever you prefer.)

Crypto (client-side): Web Crypto API (SubtleCrypto). Derive a symmetric key from the user’s password via PBKDF2 (with per-user salt) and use AES-GCM to encrypt/decrypt vault items. Why: built-in, no extra native deps, strong when used correctly. (If you want Argon2 later, swap derivation to argon2-wasm.)

DB & hosting: MongoDB Atlas (free tier) + Vercel for Next.js. No plaintext in DB or logs.

Acceptance checklist mapping (so you know what to show)

Sign up + login → server only sees bcrypt hash & salt; vault items saved are encrypted blobs.

Generator UI with slider and toggles (numbers / letters / symbols / exclude look-alikes).

Copy to clipboard auto clears after ~15s.

Search/filter over item titles/username in client-side list (or server query on encrypted metadata if you store non-sensitive metadata).

Demo recording: show generate → save → search → edit → delete; show DB (only blobs).

Quick project file plan (what to create)

/pages/_app.tsx — app wrapper

/pages/api/auth/* — signup/login endpoints (bcrypt + JWT cookie)

/pages/api/vault/* — CRUD endpoints (require JWT auth)

/lib/crypto.ts — client-side crypto helpers (derive key, encrypt, decrypt)

/components/PasswordGenerator.tsx — generator UI

/components/VaultPanel.tsx — list / search / edit UI

.env — MONGODB_URI, JWT_SECRET (server only)