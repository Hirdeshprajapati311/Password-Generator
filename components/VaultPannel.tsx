'use client'
import { decryptData, encryptData } from '@/lib/crypto';
import { VaultItem } from '@/lib/types/vault';
import { useVaultStore } from '@/store/useVaultStore';
import { Edit, Eye, EyeOff, Save, X, Loader2, KeyRound, Copy, Trash2, Shield, User, Link, FileText, Bookmark } from 'lucide-react';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Cache for decrypted passwords to avoid re-decryption
const decryptionCache = new Map<string, string>();

const VaultPannel = ({ masterKey }: { masterKey: string }) => {
  const { items, fetchVault, deleteItem, updateItem } = useVaultStore()
  const [revealed, setRevealed] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [editingItem, setEditingItem] = useState<VaultItem | null>(null)
  const [editForm, setEditForm] = useState({
    title: '',
    username: '',
    url: '',
    notes: '',
    password: ''
  })
  const [mounted, setMounted] = useState(false)
  const [showEditPassword, setShowEditPassword] = useState(false); // Renamed state to avoid conflict with `renderItem`

  // Set mounted state on client
  useEffect(() => {
    setMounted(true)
  }, [])

  // Precomputing revealed items for better performance
  const revealedItems = useMemo(() => {
    return items.filter(item => revealed[item._id]);
  }, [items, revealed]);

  // Clear cache when encryption key changes
  useEffect(() => {
    decryptionCache.clear();
  }, [masterKey]);

  // Clear cache when items change (in case of updates)
  useEffect(() => {
    // Only clear cache for items that no longer exist
    const currentItemIds = new Set(items.map(item => item._id));
    decryptionCache.forEach((_, key) => {
      if (!currentItemIds.has(key)) {
        decryptionCache.delete(key);
      }
    });
  }, [items]);

  // Fetching vault only after component is mounted
  useEffect(() => {
    if (mounted) {
      fetchVault()
    }
  }, [fetchVault, mounted])

  const toggleReveal = useCallback(async (item: VaultItem) => {
    const itemId = item._id;

    // If already revealed, just hide it
    if (revealed[itemId]) {
      setRevealed(prev => ({ ...prev, [itemId]: false }))
      return;
    }

    // If already in cache, just show it
    if (decryptionCache.has(itemId)) {
      setRevealed(prev => ({ ...prev, [itemId]: true }))
      return;
    }
    // Otherwise, decrypt it
    try {
      setLoading(prev => ({ ...prev, [itemId]: true }))
      const plaintext = await decryptData(item.encrypted, masterKey)

      // Cache the decrypted result
      decryptionCache.set(itemId, plaintext);
      setRevealed(prev => ({ ...prev, [itemId]: true }))
      toast.info(`Password for "${item.title}" revealed.`)
    } catch (err) {
      console.error("Decryption failed", err);
      toast.error('Failed to decrypt password. Check encryption key.');
    } finally {
      setLoading(prev => ({ ...prev, [itemId]: false }))
    }
  }, [masterKey, revealed]);

  // Function to copy decrypted password to clipboard
  const copyToClipboard = (id: string, title: string) => {
    const password = decryptionCache.get(id);
    if (password) {
      navigator.clipboard.writeText(password);
      toast.success(`Password for "${title}" copied to clipboard!`);
    } else {
      toast.error("Password not decrypted yet. Please reveal it first.");
    }
  };


  const handleDelete = useCallback((id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      // Clearing from cache when deleting
      decryptionCache.delete(id);
      deleteItem(id);
      toast.success(`Item "${title}" deleted.`);
    }
  }, [deleteItem]);

  const handleEdit = useCallback(async (item: VaultItem) => {
    setEditingItem(null); // Closeing any existing edit form before processing new one
    try {
      // Decrypting the password for editing
      let password = '';
      if (decryptionCache.has(item._id)) {
        password = decryptionCache.get(item._id)!;
      } else {
        setLoading(prev => ({ ...prev, [item._id]: true }));
        password = await decryptData(item.encrypted, masterKey);
        decryptionCache.set(item._id, password);
      }

      setEditingItem(item);
      setEditForm({
        title: item.title,
        username: item.username || '',
        url: item.url || '',
        notes: item.notes || '',
        password: password
      });
      setShowEditPassword(false); // Reseting password visibility for modal
      setLoading(prev => ({ ...prev, [item._id]: false }));
    } catch (err) {
      console.error("Failed to decrypt for editing:", err);
      toast.error('Failed to load password for editing.');
      setLoading(prev => ({ ...prev, [item._id]: false }));
    }
  }, [masterKey]);

  const handleSaveEdit = useCallback(async () => {
    if (!editingItem) return;

    try {
      setLoading(prev => ({ ...prev, [editingItem._id]: true }));

      // Re-encrypting the password if it was changed
      let encrypted = editingItem.encrypted;
      if (editForm.password !== decryptionCache.get(editingItem._id)) {
        encrypted = await encryptData(editForm.password, masterKey);
        // Updateing cache with new password
        decryptionCache.set(editingItem._id, editForm.password);
      }

      await updateItem(editingItem._id, {
        title: editForm.title,
        username: editForm.username,
        url: editForm.url,
        notes: editForm.notes,
        encrypted
      });

      toast.success(`Item "${editingItem.title}" updated successfully.`);
      setEditingItem(null);
      setEditForm({ title: '', username: '', url: '', notes: '', password: '' });
    } catch (err) {
      console.error("Failed to update item:", err);
      toast.error('Failed to update item.');
    } finally {
      setLoading(prev => ({ ...prev, [editingItem._id]: false }));
    }
  }, [editingItem, editForm, masterKey, updateItem]);

  const handleCancelEdit = useCallback(() => {
    setEditingItem(null);
    setEditForm({ title: '', username: '', url: '', notes: '', password: '' });
  }, []);

  const toggleRevealAll = useCallback(async () => {
    const someRevealed = Object.values(revealed).some(Boolean);

    if (someRevealed) {
      // Hide all
      setRevealed({});
      toast.info("All passwords hidden.");
    } else {
      // Show all - decrypt only what's not in cache
      setLoading(prev => ({ ...prev, bulk: true }));
      toast.loading("Decrypting all passwords...", { id: 'bulk-decrypt' });

      try {
        const itemsToDecrypt = items.filter(item => !decryptionCache.has(item._id));

        // Decrypting in batches for better performance
        const batchSize = 3;
        for (let i = 0; i < itemsToDecrypt.length; i += batchSize) {
          const batch = itemsToDecrypt.slice(i, i + batchSize);
          await Promise.all(
            batch.map(async (item) => {
              try {
                const plaintext = await decryptData(item.encrypted, masterKey);
                decryptionCache.set(item._id, plaintext);
              } catch (err) {
                console.error(`Failed to decrypt ${item.title}:`, err);
                decryptionCache.set(item._id, 'Decryption Error');
              }
            })
          );
        }

        // Revealing all items
        const allRevealed = items.reduce((acc, item) => {
          acc[item._id] = true;
          return acc;
        }, {} as Record<string, boolean>);

        setRevealed(allRevealed);
        toast.success("All passwords revealed!", { id: 'bulk-decrypt' });

      } catch (err) {
        console.error('Bulk decryption failed:', err);
        toast.error('Failed to decrypt some passwords.', { id: 'bulk-decrypt' });
      } finally {
        setLoading(prev => ({ ...prev, bulk: false }));
      }
    }
  }, [items, revealed, masterKey]);

  const renderItem = useCallback((item: VaultItem) => {
    const isRevealed = revealed[item._id];
    const isLoading = loading[item._id];
    const cachedPassword = decryptionCache.get(item._id);

    return (
      <Card key={item._id} className=" shadow-md transition-shadow hover:shadow-lg dark:border-white border border-black">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Bookmark className="h-5 w-5 text-primary" /> {item.title}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleEdit(item)}
              disabled={loading.bulk}
              title="Edit item"
            >
              <Edit size={16} />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => handleDelete(item._id, item.title)}
              title="Delete item"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {item.username && (
            <div className="flex items-center text-sm text-muted-foreground">
              <User className="mr-2 h-4 w-4" />
              <span className="font-medium">Username:</span>
              <span className="ml-2 truncate">{item.username}</span>
            </div>
          )}
          {item.url && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Link className="mr-2 h-4 w-4" />
              <span className="font-medium">URL:</span>
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="ml-2 truncate hover:underline text-blue-500 dark:text-blue-400">
                {item.url}
              </a>
            </div>
          )}
          {item.notes && (
            <div className="flex items-start text-sm text-muted-foreground pt-1">
              <FileText className="mt-0.5 mr-2 h-4 w-4 flex-shrink-0" />
              <span className="font-medium">Notes:</span>
              <p className="ml-2 text-sm max-h-12 overflow-hidden truncate whitespace-normal">{item.notes}</p>
            </div>
          )}
          <Separator />
          {/* Password Section */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <span className="font-semibold text-lg">Password:</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                onClick={() => toggleReveal(item)}
                disabled={isLoading || loading.bulk}
                className="min-w-32 font-mono text-base tracking-widest"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isRevealed ? (
                  <span className="text-primary dark:text-white truncate">{cachedPassword}</span>
                ) : (
                  '••••••••'
                )}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(item._id, item.title)}
                disabled={!isRevealed || !cachedPassword || cachedPassword === 'Decryption Error'}
                title="Copy Password"
              >
                <Copy size={16} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }, [toggleReveal, handleDelete, handleEdit, revealed, loading]);

  // Show loading state until component is mounted
  if (!mounted) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-6 w-6 animate-spin mr-2 text-primary" />
        <p className="text-lg text-muted-foreground">Preparing vault panel...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center pb-2">
        <div className="text-sm text-muted-foreground">
          Showing {items.length} items • {revealedItems.length} revealed • {decryptionCache.size} cached
          {editingItem && <span className="ml-2 text-primary font-medium">• Editing mode active</span>}
        </div>

        {items.length > 0 && (
          <Button
            onClick={toggleRevealAll}
            disabled={loading.bulk || editingItem !== null}
            variant={Object.values(revealed).some(Boolean) ? "outline" : "default"}
          >
            {loading.bulk ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : Object.values(revealed).some(Boolean) ? (
              <EyeOff className="h-4 w-4 mr-2" />
            ) : (
              <Eye className="h-4 w-4 mr-2" />
            )}
            {loading.bulk ? 'Processing...' : Object.values(revealed).some(Boolean) ? 'Hide All' : 'Reveal All'}
          </Button>
        )}
      </div>

      {/* Vault List */}
      {items.length === 0 ? (
        <Card className="shadow-lg border-dashed border-2 dark:border-gray-700">
          <CardContent className="text-center p-12 space-y-3">
            <Shield className="h-10 w-10 text-muted-foreground mx-auto" />
            <p className="text-lg font-medium text-muted-foreground">No items in your vault yet.</p>
            <p className="text-sm text-muted-foreground">
              Use the form on the left to add your first secret credential.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map(renderItem)}
        </div>
      )}

      {/* Edit Modal (Dialog Component) */}
      <Dialog  open={editingItem !== null} onOpenChange={handleCancelEdit}>
        <DialogContent className="bg-white dark:bg-gray-900  sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary">
              <Edit className="h-5 w-5" /> Edit: {editingItem?.title}
            </DialogTitle>
            <DialogDescription>
              Update the details and re-encrypt the item with your master key.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Title & Username */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="edit-title">Title *</Label>
                <Input
                  id="edit-title"
                  value={editForm.title}
                  onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit-username">Username</Label>
                <Input
                  id="edit-username"
                  value={editForm.username}
                  onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                />
              </div>
            </div>

            {/* URL */}
            <div className="space-y-1">
              <Label htmlFor="edit-url">URL</Label>
              <Input
                id="edit-url"
                type="url"
                value={editForm.url}
                onChange={(e) => setEditForm(prev => ({ ...prev, url: e.target.value }))}
              />
            </div>

            {/* Password */}
            <div className="space-y-1">
              <Label htmlFor="edit-password">Password *</Label>
              <div className="relative">
                <Input
                  id="edit-password"
                  type={showEditPassword ? "text" : "password"}
                  value={editForm.password}
                  onChange={(e) => setEditForm(prev => ({ ...prev, password: e.target.value }))}
                  className="font-mono pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowEditPassword((prev) => !prev)}
                  className="absolute right-0 top-0 h-full w-10 text-muted-foreground hover:bg-transparent"
                >
                  {showEditPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </Button>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                value={editForm.notes}
                onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancelEdit}>
              <X size={18} className="mr-2" /> Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={loading[editingItem?._id || ''] || !editForm.title || !editForm.password}
              className="bg-green-500 hover:bg-green-700"
            >
              {loading[editingItem?._id || ''] ? (
                <Loader2 size={18} className="mr-2 animate-spin" />
              ) : (
                <Save size={18} className="mr-2" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VaultPannel;