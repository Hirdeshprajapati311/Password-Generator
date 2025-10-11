'use client'
import { deriveEncryptionKey, encryptData, generateEncryptionKey } from '@/lib/crypto';
import React, { useState } from 'react';
import { toast } from 'sonner';

// Import necessary shadcn components and icons
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, Mail, Lock as LockIcon, Loader2, KeyRound } from 'lucide-react';

const SignUpPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('');
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false); // New state for loading indicator

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true); // Start loading

    try {
      console.log("Generating permanent encryption key");

      const permanentEncryptionKey = generateEncryptionKey();
      console.log("Permanent key generated:", permanentEncryptionKey.substring(0, 20) + "...");

      console.log("Encrypting master key with password...");

      // LOGIC PRESERVED: Encrypt master key with user's password
      const encryptedMasterKey = await encryptData(permanentEncryptionKey, password)
      console.log("Master key encrypted", encryptedMasterKey);

      // LOGIC PRESERVED: Derive salt from password (used for API auth, though salt isn't sent here)
      console.log("Deriving salt from password...")
      const { salt } = await deriveEncryptionKey(password);
      console.log("Salt derived:", salt.substring(0, 10) + "...")

      console.log("Sending to API...", {
        email,
        passwordLength: password.length,
        encryptedMasterKeyType: typeof encryptedMasterKey,
        encryptedMasterKey: encryptedMasterKey
      })

      // LOGIC PRESERVED: Setup request body
      const requestBody = {
        email,
        password, // Sent for server-side hashing/derivation
        action: "signup",
        encryptedMasterKey: encryptedMasterKey, // The encrypted master key object
      };

      console.log("📦 Request body:", requestBody);

      // LOGIC PRESERVED: API call
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })
      console.log("API Response status", res.status);

      const data = await res.json();
      console.log("API Response data:", data);

      if (res.ok && data.success) {
        // LOGIC PRESERVED: Save temporary key and redirect
        localStorage.setItem('vaultKey', permanentEncryptionKey);
        toast.success("Signup successful");
        window.location.href = "/vault"
      } else {
        // LOGIC PRESERVED: Handle API errors
        setError(data.error || "Signup failed");
        toast.error(data.error || "Signup failed");
        return;
      }
    } catch (err) {
      // LOGIC PRESERVED: Handle server errors
      console.log(err)
      setError("Server error")
      toast.error("Server error")
    } finally {
      setIsLoading(false); // Stop loading regardless of outcome
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950 p-4">

      {/* UPDATED: Use Card component for a clean, contained form */}
      <Card className="w-full max-w-sm shadow-2xl border border-primary/20 bg-card/80 backdrop-blur-md">
        <CardHeader className="space-y-1 text-center">
          <UserPlus className="h-10 w-10 text-primary mx-auto mb-2" />
          <CardTitle className="text-2xl">Create Vault Account</CardTitle>
          <CardDescription>
            Securely set up your master credentials.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">

            {/* Email Field */}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10" // Space for the icon
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="grid gap-2">
              <Label htmlFor="password">Master Password</Label>
              <div className="relative">
                <LockIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Choose a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10" // Space for the icon
                />
              </div>
            </div>

            {/* Error Message */}
            {error && <p className="text-sm text-center font-medium text-red-500">{error}</p>}

            {/* Submit Button */}
            <Button type="submit" className="w-full mt-2 h-10" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <KeyRound className="mr-2 h-4 w-4" />
              )}
              {isLoading ? "Creating Account..." : "Sign Up"}
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center text-sm">
            Already have an account?{' '}
            <a href="/auth/login" className="text-primary hover:underline font-medium">
              Login
            </a>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}

export default SignUpPage;