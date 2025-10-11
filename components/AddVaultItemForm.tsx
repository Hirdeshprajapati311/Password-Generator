'use client'
import { useState } from 'react';
import { encryptData } from '@/lib/crypto';
import { useVaultStore } from '@/store/useVaultStore';
import { Eye, EyeOff, PlusCircle, Bookmark, User, Link, FileText, Lock as LockIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface AddVaultItemFormProps {
  masterKey: string;
  onFormSubmit?: () => void;
}

export const AddVaultItemForm = ({ masterKey, onFormSubmit }: AddVaultItemFormProps) => {
  const { fetchVault } = useVaultStore();

  const [title, setTitle] = useState('');
  const [username, setUsername] = useState('');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Added for loading state

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!title || !password) {
      toast.error('Title and Password are required!');
      setIsSubmitting(false);
      return;
    }

    try {
      const encrypted = await encryptData(password, masterKey);

      const res = await fetch('/api/vault', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, username, url, notes, encrypted }),
      });

      if (!res.ok) {
        // Handle specific errors if available from API, otherwise a generic one
        const data = await res.json();
        throw new Error(data.error || 'Failed to add item to vault');
      }

      toast.success("Vault item added successfully! 🎉")

      fetchVault();

      // Clear form
      setTitle('');
      setUsername('');
      setUrl('');
      setNotes('');
      setPassword('');

      // Call parent submit handler if provided (e.g., to close a dialog)
      if (onFormSubmit) {
        onFormSubmit();
      }

    } catch (error) {
      console.error("Error adding vault item:", error);
      const errorMessage = (error as Error).message || 'An unknown error occurred.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    // Replaced generic div/form with Card component
    <Card className="w-full bg-white dark:bg-black max-w-lg mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-bold text-primary">
          <PlusCircle className="h-5 w-5" /> Add New Vault Item
        </CardTitle>
        <CardDescription>
          Enter the details for the new credential you want to encrypt and save.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Title */}
          <div className="space-y-1">
            <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
            <div className="relative">
              <Bookmark className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="title"
                placeholder="Website name, service name, etc."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="pl-10"
              />
            </div>
          </div>

          {/* Username */}
          <div className="space-y-1">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="username"
                placeholder="Account username or email (optional)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* URL */}
          <div className="space-y-1">
            <Label htmlFor="url">URL</Label>
            <div className="relative">
              <Link className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="url"
                placeholder="https://example.com (optional)"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Separator />

          {/* Password */}
          <div className="space-y-1">
            <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
            <div className="relative w-full">
              <LockIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter or paste password here"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full font-mono pr-10 pl-10"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-1 h-full w-10 text-muted-foreground hover:bg-transparent"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </Button>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <Label htmlFor="notes">Notes</Label>
            <div className="relative">
              <FileText className="absolute left-3 top-4 h-4 w-4 text-muted-foreground" />
              <Textarea
                id="notes"
                placeholder="Any special instructions or recovery details (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="resize-y min-h-[80px] pt-4 pl-10"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-10 mt-6"
            disabled={isSubmitting || !title || !password} // Disable if no title/password
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <PlusCircle className="mr-2 h-4 w-4" />
            )}
            {isSubmitting ? "Adding Item..." : "Add Item to Vault"}
          </Button>

        </form>
      </CardContent>
    </Card>
  );
};