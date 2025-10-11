'use client'
import { decryptData } from '@/lib/crypto';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'sonner';

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('');
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      console.log("🔐 Attempting login for:", email);

      const res = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          action: "login",
        }),
      });

      const userData = await res.json();
      console.log("📥 Login API response:", userData);

      if (res.ok && userData.success) {

        try {
          // ✅ Parse the stringified encrypted master key first
          const encryptedMasterKey = JSON.parse(userData.encryptedMasterKey);

          const masterKey = await decryptData(encryptedMasterKey, password);
          localStorage.setItem('vaultKey', masterKey);
          toast.success("Login successful");
          router.push("/vault");
        } catch (decryptError) {
          console.error("❌ Master key decryption failed:", decryptError);
          setError("Failed to decrypt vault. Please try again.");
          toast.error("Login failed - decryption error");
        }
      } else {
        // ✅ Handle failed login
        setError(userData.error || "Login failed");
        toast.error(userData.error || "Login failed");
      }
    } catch (err) {
      console.error("❌ Login error:", err);
      setError("Server error");
      toast.error("Unable to login");
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen dark:bg-black bg-gray-50">
      <h1 className="text-3xl dark:text-white font-bold mb-6">Login</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-80">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border text-black dark:bg-gray-800 dark:text-white p-2 rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="border text-black dark:bg-gray-800 dark:text-white outline-black p-2 rounded"
        />
        <button type="submit" className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Login
        </button>
        {error && <p className="text-red-500">{error}</p>}
      </form>
      <p className="mt-4">
        Don&apos;t have an account? <a href="/auth/signup" className="text-blue-600">Sign Up</a>
      </p>
    </div>
  );
}

export default LoginPage;