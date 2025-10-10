'use client'
import React, { useState } from 'react';
import { toast } from 'sonner';

const SignUpPage = () => {


  const [email,setEmail] = useState('')
  const [password, setPassword] = useState('');
  const [error, setError] = useState('')
 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try{
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          action:"signup"
        }),
      })
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }
      toast.success("Signup successful")
    } catch (err) {
      console.log(err)
      setError("Server error")
      toast.error("Server error")
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-6">Sign Up</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-80">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border p-2 rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="border p-2 rounded"
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
