'use client'
import React, { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle, UserCircle2, Shield } from 'lucide-react';
import { AddVaultItemForm } from '@/components/AddVaultItemForm';
import VaultPannel from '@/components/VaultPannel';
import { useAuthStore } from '@/store/useAuthStore';
import { Separator } from '@/components/ui/separator';

const VaultPage = () => {
  const [masterKey, setMasterKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { userEmail, username } = useAuthStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const key = localStorage.getItem('vaultKey');
        if (key) {
          setMasterKey(key);
        } else {
          console.error("No encryption key found in localStorage.");
          setError("Encryption key missing. Please log out and log in again to re-establish your secure session.");
        }
      } catch (e) {
        console.error("Failed to access localStorage:", e);
        setError("Could not access secure storage. Please ensure your browser settings allow site data.");
      }
    }, 200); // 200ms delay

    return () => clearTimeout(timer);
  }, []);

  if (!masterKey && !error) {
    return (
      <div className="flex h-[calc(100vh-80px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-3 text-lg text-muted-foreground">Loading Vault...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-80px)] items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-xl shadow-lg border-red-500">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="font-bold">Authentication Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl p-4 py-10 sm:p-6 lg:p-10">

      {/* 1. Header Section (Enhanced Visuals) */}
      <header className="mb-4 flex flex-col items-start justify-between gap-4 border-b pb-6 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">Your Vault</h1>
            <p className="text-lg text-muted-foreground">Securely manage your encrypted credentials.</p>
          </div>
        </div>
        {userEmail && (
          <div className="flex border-black dark:border-white items-center gap-2 rounded-full border bg-muted px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm">
            <UserCircle2 className="h-4 w-4" />
            <span className="truncate">{userEmail}</span>
          </div>
        )}

      </header>
      <div className='mb-2 ml-1 text-xl dark:text-white underline font-serif'>Hello! <span className='font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 '>{username || "User"}</span></div>


      {/* 2. Main Content Area - Split Layout for visual distinction */}
      <main className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_2fr]">

        {/* Left Column: Add Item Form */}
        <div className="lg:sticky lg:top-8 lg:h-fit">
          {/* AddVaultItemForm is expected to be a Card, making it stand out here */}
          <AddVaultItemForm masterKey={masterKey!} />
        </div>

        {/* Right Column: Vault List Panel */}
        <div className='bg-white border-2 dark:border-white border-black  dark:bg-black p-4 rounded-xl'>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight text-primary">Manage Credentials</h2>
          <Separator className="mb-6" />
          <VaultPannel masterKey={masterKey!} />
        </div>

      </main>
    </div>
  );
}

export default VaultPage;