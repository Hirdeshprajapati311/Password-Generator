
# REQUIREMENTS

Crypto, MongoDB, bcrypt + JWT(Httponly cookie)
hosting -> vercel

## Data Flow (Client-First Privacy)

User signs up → password hashed with bcrypt on server.

### When adding a vault item:

- Browser derives symmetric key from password (PBKDF2 + salt)
- Encrypts { username, password, url, notes } with AES-GCM
- Sends encrypted blob + metadata (title, iv, salt, tag) to backend
- Server stores encrypted blob in MongoDB.
- On fetch, backend returns encrypted blob → browser decrypts.

### Libraries

zustand, axios, lucide-react, bcrypt, jsonwebtoken, mongoose, cookie, zod

## Folder Structure

/app
  /api
    /auth
      route.ts         → handles signup/login
    /vault
      route.ts         → CRUD operations (JWT protected)
  /vault
    page.tsx           → main vault UI
  /generator
    page.tsx           → password generator UI
  layout.tsx
  page.tsx             → home/landing
  globals.css
/lib
  crypto.ts            → encryption helpers
  auth.ts              → JWT helpers
  db.ts                → MongoDB connection
/components
  PasswordGenerator.tsx
  VaultPanel.tsx
  Navbar.tsx
/store
  useAuthStore.ts
  useVaultStore.ts
/utils
  validations.ts
