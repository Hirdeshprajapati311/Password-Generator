'use client'
import { decryptData } from '@/lib/crypto';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { KeyRound, LogIn, Mail, Lock as LockIcon, Loader2 } from 'lucide-react'; 

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('');
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false); 
  const { setUsername, setUserEmail } = useAuthStore();
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true); // Start loading

    try {

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

      if (res.ok && userData.success) {

        try {
          const encryptedMasterKey = JSON.parse(userData.encryptedMasterKey);

          const masterKey = await decryptData(encryptedMasterKey, password);
          localStorage.setItem('vaultKey', masterKey);
          setUsername(userData.username);
          setUserEmail(userData.email);
          toast.success("Login successful");
          router.push("/vault");
        } catch (decryptError) {
          console.error("❌ Master key decryption failed:", decryptError);
          setError("Failed to decrypt vault. Please try again.");
          toast.error("Login failed - decryption error");
        }
      } else {
        setError(userData.error || "Login failed");
        toast.error(userData.error || "Login failed");
      }
    } catch (err) {
      console.error("❌ Login error:", err);
      setError("Server error");
      toast.error("Unable to login");
    } finally {
      setIsLoading(false); 
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950 p-4">

      <Card className="w-full max-w-sm shadow-2xl border border-primary/20 bg-card/80 backdrop-blur-md">
        <CardHeader className="space-y-1 text-center">
          <KeyRound className="h-10 w-10 text-primary mx-auto mb-2" />
          <CardTitle className="text-2xl">Vault Login</CardTitle>
          <CardDescription>
            Enter your credentials to securely access your password vault.
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
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <LockIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Master Password"
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
            <Button type="submit" className="bg-zinc-500 text-white dark:border-white border w-full mt-2 h-10" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="mr-2 h-4 w-4" />
              )}
              {isLoading ? "Logging In..." : "Login"}
            </Button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center text-sm">
            Don&apos;t have an account?{' '}
            <a href="/auth/signup" className="text-primary hover:underline font-medium">
              Sign Up
            </a>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}

export default LoginPage;