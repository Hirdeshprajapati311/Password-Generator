# 🛡️ PassVault

A modern, encrypted password manager and generator built with **Next.js**, **Tailwind CSS**, **ShadCN**, **MongoDB**, and **AES-GCM encryption**.

---

## 🚀 Overview

**PassVault** lets you securely generate, store, and manage passwords — all protected with a **master key encryption system**.  
It demonstrates full-stack security architecture, modern UI design, and backend encryption logic — perfect for recruiters evaluating real-world project skills.

---

## ✨ Features

- 🔒 **Master Key Encryption** – All passwords are encrypted using AES-GCM derived from your master key.  
- 🧠 **Zero-Knowledge Design** – Plaintext passwords are *never* stored or transmitted.  
- ⚙️ **Password Generator** – Generate strong, customizable passwords instantly.  
- 🗂️ **Vault Management** – Add, edit, or delete stored credentials securely.  
- 📋 **Clipboard Auto-Clear** – Automatically clears copied passwords after a few seconds.  
- 🌙 **Dark Mode** – Sleek UI with ShadCN theme support.  
- ☁️ **Cloud Storage** – Passwords stored securely in MongoDB with Mongoose.

---

## 🧰 Tech Stack

| Category | Technologies |
|-----------|--------------|
| **Frontend** | Next.js 14, Tailwind CSS, ShadCN UI |
| **Backend** | Next.js API Routes, Mongoose, MongoDB |
| **Encryption** | AES-GCM (Crypto API) |
| **Hosting** | Vercel |
| **Language** | TypeScript |

---

## 🎯 Audience

Built for **recruiters and developers** to showcase:

- Mastery of **full-stack security design**  
- Clean **UI/UX with ShadCN and Tailwind**  
- Real-world **encryption and data protection** logic  
- **Modular Next.js 15 architecture**
- Backend is taken care with **Next API**

---

## ⚙️ How It Works

1. User logs in or registers with an email.  
2. A **master key** is created locally for encryption/decryption.  
3. Passwords are encrypted using **AES-GCM** before storage.  
4. Users can generate, edit, or delete passwords in their personal vault.  
5. Clipboard clears automatically after copying.  

---

## 🖼️ Screenshots

| Light Mode | Dark Mode |
|-------------|------------|
| <img width="1916" height="887" alt="Screenshot 2025-10-12 105455" src="https://github.com/user-attachments/assets/4e54cf56-5fe9-49cd-9fdb-1a6e525cf7a8" /> <br> <img width="1918" height="881" alt="Screenshot 2025-10-12 105615" src="https://github.com/user-attachments/assets/a55e8497-feb1-476a-82c2-4c6edfc4e173" /> <br> <img width="1918" height="880" alt="Screenshot 2025-10-12 105744" src="https://github.com/user-attachments/assets/a90c0b40-1565-4095-bd86-e93683924c8b" /> | <img width="1913" height="892" alt="Screenshot 2025-10-12 105118" src="https://github.com/user-attachments/assets/658d3a12-cc3c-467c-9160-79229155c2b9" /> <br> <img width="1918" height="878" alt="Screenshot 2025-10-12 105820" src="https://github.com/user-attachments/assets/d5fdc9b2-749e-4ec7-a289-a6e1765393cc" /> <br> <img width="1918" height="883" alt="Screenshot 2025-10-12 105659" src="https://github.com/user-attachments/assets/2bf95cdb-cfe7-4937-8fe9-f15cec0b7886" /> |


---

## 🧑‍💻 Getting Started

```bash
# Clone the repository
git clone https://github.com/Hirdeshprajapati311/password-generator.git
cd password-generator

# Install dependencies
npm install

# Add your environment variables
MONGO_URI=your_mongodb_connection_string

# Start development server
npm run dev
