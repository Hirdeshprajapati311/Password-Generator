'use client'
import { deriveEncryptionKey, encryptData, generateEncryptionKey } from '@/lib/crypto';
import React, { useState } from 'react';
import { toast } from 'sonner';

const SignUpPage = () => {


  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('');
  const [error, setError] = useState('')


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      console.log("Generating permanent encryption key");
      
      const permanentEncryptionKey = generateEncryptionKey();
      console.log("Permanent key generated:", permanentEncryptionKey.substring(0, 20) + "...");
      
      console.log("Encrypting master key with password...");
      
      
      

      const encryptedMasterKey = await encryptData(permanentEncryptionKey, password)
      console.log("Master key encrypted",encryptedMasterKey);


      console.log("Deriving salt from password...")
      const { salt } = await deriveEncryptionKey(password);
      console.log("Salt derived:", salt.substring(0, 10) + "...")
      
      console.log("Sending to API...", {
        email,
        passwordLength:password.length,
        encryptedMasterKeyType:typeof encryptedMasterKey,
        encryptedMasterKey:encryptedMasterKey
      })

      const requestBody = {
        email,
        password,
        action: "signup",
        encryptedMasterKey: encryptedMasterKey, // Don't stringify it!
      };

      console.log("📦 Request body:", requestBody);

      const res = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })
      console.log("API Response status",res.status);
      
      const data = await res.json();
      console.log("API Response data:",data);
      
      if (res.ok && data.success) {
        localStorage.setItem('vaultKey', permanentEncryptionKey);
        toast.success("Signup successful");
        window.location.href = "/vault"
      } else {
        setError(data.error || "Signup failed");
        toast.error(data.error || "Signup failed");
        return;
      }
    } catch (err) {
      console.log(err)
      setError("Server error")
      toast.error("Server error")
    }
  }

  return (
    <div className="flex flex-col items-center justify-center dark:bg-black min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-6">Sign Up</h1>
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
          placeholder="Create Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="border text-black dark:bg-gray-800 dark:text-white p-2 rounded"
        />
        <button type="submit" className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Sign Up
        </button>
        {error && <p className="text-red-500">{error}</p>}
      </form>
      <p className="mt-4">
        Already have an account? <a href="/auth/login" className="text-blue-600">Login</a>
      </p>
    </div>
  );
}

export default SignUpPage;
