# Folder structure

/app
  /auth
    login
    signup
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




# Flow diagram

User logs in → redirected to /vault
          │
          └─ Fetch vault items → display in VaultPanel
                     │
             ┌───────┴─────────┐
        View / Edit / Delete  Add new password
