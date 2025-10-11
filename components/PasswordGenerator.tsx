'use client'
import { encryptData } from "@/lib/crypto";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Wand2, Copy, Save, X, Lock } from "lucide-react";


const PasswordGenerator = () => {
  // --- LOGIC PRESERVED: State declarations ---
  const [length, setLength] = useState(12);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(false);
  const [password, setPassword] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [vaultTitle, setVaultTitle] = useState("New Password");
  const [vaultUsername, setVaultUsername] = useState("");
  const [vaultUrl, setVaultUrl] = useState("");
  const [vaultNotes, setVaultNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const clearClipboardTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (clearClipboardTimeoutRef.current) {
        clearTimeout(clearClipboardTimeoutRef.current);
      }
    };
  }, []);

  const generatePassword = useCallback(() => {
    let charset = "";
    if (includeUppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (includeLowercase) charset += "abcdefghijklmnopqrstuvwxyz";
    if (includeNumbers) charset += "0123456789";
    if (includeSymbols) charset += "!@#$%^&*()_+[]{}<>?,.";

    if (!charset) {
      toast.error("Please select at least one character set option!");
      return;
    }

    let newPassword = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      newPassword += charset[randomIndex];
    }

    setPassword(newPassword);
  }, [length, includeUppercase, includeLowercase, includeNumbers, includeSymbols]);

  // Generate a password on first load
  useEffect(() => {
    generatePassword();
  }, [generatePassword]);


  const clearClipboard = async () => {
    try {
      await navigator.clipboard.writeText("");
      toast.info("Clipboard cleared for security");
    } catch (error) {
      console.error("Failed to clear clipboard:", error);
      toast.error("Cannot auto-clear clipboard; please clear manually");
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(password);
      toast.success("Password copied to clipboard! Will clear in 15 seconds");

      if (clearClipboardTimeoutRef.current) {
        clearTimeout(clearClipboardTimeoutRef.current);
      }

      clearClipboardTimeoutRef.current = setTimeout(() => {
        clearClipboard();
        clearClipboardTimeoutRef.current = null;
      }, 15000);

    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleSaveToVault = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password) {
      toast.error("No password to Save");
      return;
    }

    setIsSaving(true);
    try {
      // Get or create encryption key
      const key = localStorage.getItem("vaultKey");
      if (!key) {
        toast.error("No encryption key found. Please log in again.");
        return;
      }

      const encrypted = await encryptData(password, key);

      const res = await fetch("/api/vault", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: vaultTitle,
          username: vaultUsername,
          url: vaultUrl,
          notes: vaultNotes,
          encrypted,
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      toast.success("Password saved to Vault!");
      setIsModalOpen(false);
      // Reset form states
      setVaultTitle("New Password");
      setVaultUsername("");
      setVaultUrl("");
      setVaultNotes("");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      console.error("Save to vault error:", errorMessage);
      toast.error(errorMessage || "Error saving password")
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card className="mx-auto mt-8 max-w-lg shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl font-bold text-primary">
          <Wand2 className="h-6 w-6" /> Password Generator
        </CardTitle>
        <CardDescription>
          Create strong, unique passwords based on your criteria.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">

        {/* 1. Password Display */}
        <div className="flex w-full items-center space-x-2 rounded-lg border bg-muted p-3">
          <Input
            type="text"
            value={password}
            readOnly
            className="flex-1 border-none bg-transparent font-mono text-lg font-bold tracking-widest focus-visible:ring-0"
            placeholder="Click Generate"
          />
          <Button onClick={copyToClipboard} size="icon" variant="ghost" disabled={!password}>
            <Copy className="h-5 w-5" />
          </Button>
          <Button onClick={() => setIsModalOpen(true)} size="icon" variant="ghost" disabled={!password}>
            <Save className="h-5 w-5" />
          </Button>
        </div>


        {/* 2. Controls */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="length-slider" className="flex justify-between font-semibold">
              <span>Password Length</span>
              <span className="text-primary text-xl font-mono">{length}</span>
            </Label>
            <Slider
              id="length-slider"
              min={6}
              max={32}
              step={1}
              value={[length]}
              onValueChange={(val) => setLength(val[0])}
              // UPDATED: Changed slider track and thumb colors for better visibility
              className="[&>span:first-child]:h-2 [&>span:first-child]:bg-blue-200 dark:[&>span:first-child]:bg-primary/20 [&>span:nth-child(3)]:bg-blue-600 dark:[&>span:nth-child(3)]:bg-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-y-3">
            {/* Checkbox Group */}
            {[
              { label: "Include Uppercase (A-Z)", state: includeUppercase, setState: setIncludeUppercase },
              { label: "Include Lowercase (a-z)", state: includeLowercase, setState: setIncludeLowercase },
              { label: "Include Numbers (0-9)", state: includeNumbers, setState: setIncludeNumbers },
              { label: "Include Symbols (!@#...)", state: includeSymbols, setState: setIncludeSymbols },
            ].map((option) => (
              <div key={option.label} className="flex items-center space-x-2">
                <Checkbox
                  id={option.label}
                  checked={option.state}
                  onCheckedChange={(checked) => option.setState(checked === true)}
                />
                <label
                  htmlFor={option.label}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Generate Button */}
        <Button
          onClick={generatePassword}
          className="w-full text-lg h-12"
        >
          <Wand2 className="mr-2 h-5 w-5" /> Re-Generate Password
        </Button>
      </CardContent>

      {/* Save to Vault Modal (Dialog Component) */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-white dark:bg-black sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary">
              <Lock className="h-5 w-5" /> Save to Vault
            </DialogTitle>
            <DialogDescription>
              Enter the context for this new password before encrypting it.
            </DialogDescription>
          </DialogHeader>

          <form noValidate onSubmit={handleSaveToVault} className="grid gap-4 py-4">

            <div className="space-y-1">
              <Label htmlFor="vault-title">Title *</Label>
              <Input
                id="vault-title"
                placeholder="e.g., Google Account"
                value={vaultTitle}
                onChange={(e) => setVaultTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="vault-username">Username</Label>
              <Input
                id="vault-username"
                placeholder="e.g., your.email@example.com"
                value={vaultUsername}
                onChange={(e) => setVaultUsername(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="vault-url">URL</Label>
              <Input
                id="vault-url"
                type="url"
                placeholder="https://example.com"
                value={vaultUrl}
                onChange={(e) => setVaultUrl(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="vault-notes">Notes</Label>
              <Textarea
                id="vault-notes"
                placeholder="Any special instructions or recovery info."
                value={vaultNotes}
                onChange={(e) => setVaultNotes(e.target.value)}
                rows={2}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="vault-password">Password (Generated)</Label>
              <Input
                id="vault-password"
                value={password}
                readOnly
                className="font-mono dark:bg-gray-900  bg-muted-foreground/10"
              />
            </div>

            <DialogFooter className="mt-4 flex flex-row justify-end space-x-2">
              <Button type="button" className="bg-red-400" onClick={() => setIsModalOpen(false)} disabled={isSaving}>
                <X className="mr-2 h-4 w-4" /> Cancel
              </Button>
              <Button type="submit" className="bg-green-400" disabled={isSaving || !vaultTitle}>
                {isSaving ? (
                  <>
                    <Wand2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Encrypt & Save
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default PasswordGenerator;