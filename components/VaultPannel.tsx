'use client'
import { decryptData, encryptData } from '@/lib/crypto';
import { VaultItem } from '@/lib/types/vault';
import { useVaultStore } from '@/store/useVaultStore';
import { Edit, Save, X } from 'lucide-react';
import React, { useEffect, useState, useCallback, useMemo } from 'react';

// Cache for decrypted passwords to avoid re-decryption
const decryptionCache = new Map<string, string>();

const VaultPannel = ({ encryptionKey }: { encryptionKey: string }) => {
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

  // Set mounted state on client
  useEffect(() => {
    setMounted(true)
  }, [])

  // Precompute revealed items for better performance
  const revealedItems = useMemo(() => {
    return items.filter(item => revealed[item._id]);
  }, [items, revealed]);

  // Clear cache when encryption key changes
  useEffect(() => {
    decryptionCache.clear();
  }, [encryptionKey]);

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

  // Fetch vault only after component is mounted
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
      const plaintext = await decryptData(item.encrypted, encryptionKey)

      // Cache the decrypted result
      decryptionCache.set(itemId, plaintext);
      setRevealed(prev => ({ ...prev, [itemId]: true }))
    } catch (err) {
      console.error("Decryption failed", err);
      alert('Failed to decrypt password. Please check your encryption key.')
    } finally {
      setLoading(prev => ({ ...prev, [itemId]: false }))
    }
  }, [encryptionKey, revealed]);

  const handleDelete = useCallback((id: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      // Clear from cache when deleting
      decryptionCache.delete(id);
      deleteItem(id);
    }
  }, [deleteItem]);

  // Edit functionality
  const handleEdit = useCallback(async (item: VaultItem) => {
    try {
      // Decrypt the password for editing
      let password = '';
      if (decryptionCache.has(item._id)) {
        password = decryptionCache.get(item._id)!;
      } else {
        password = await decryptData(item.encrypted, encryptionKey);
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
    } catch (err) {
      console.error("Failed to decrypt for editing:", err);
      alert('Failed to load password for editing');
    }
  }, [encryptionKey]);

  const handleSaveEdit = useCallback(async () => {
    if (!editingItem) return;

    try {
      setLoading(prev => ({ ...prev, [editingItem._id]: true }));

      // Re-encrypt the password if it was changed
      let encrypted = editingItem.encrypted;
      if (editForm.password !== decryptionCache.get(editingItem._id)) {
        encrypted = await encryptData(editForm.password, encryptionKey);
        // Update cache with new password
        decryptionCache.set(editingItem._id, editForm.password);
      }

      await updateItem(editingItem._id, {
        title: editForm.title,
        username: editForm.username,
        url: editForm.url,
        notes: editForm.notes,
        encrypted
      });

      setEditingItem(null);
      setEditForm({ title: '', username: '', url: '', notes: '', password: '' });
    } catch (err) {
      console.error("Failed to update item:", err);
      alert('Failed to update item');
    } finally {
      setLoading(prev => ({ ...prev, [editingItem._id]: false }));
    }
  }, [editingItem, editForm, encryptionKey, updateItem]);

  const handleCancelEdit = useCallback(() => {
    setEditingItem(null);
    setEditForm({ title: '', username: '', url: '', notes: '', password: '' });
  }, []);

  // Batch reveal/hide all passwords
  const toggleRevealAll = useCallback(async () => {
    const someRevealed = Object.values(revealed).some(Boolean);

    if (someRevealed) {
      // Hide all
      setRevealed({});
    } else {
      // Show all - decrypt only what's not in cache
      setLoading(prev => ({ ...prev, bulk: true }));

      try {
        const itemsToDecrypt = items.filter(item => !decryptionCache.has(item._id));

        // Decrypt in batches for better performance
        const batchSize = 3;
        for (let i = 0; i < itemsToDecrypt.length; i += batchSize) {
          const batch = itemsToDecrypt.slice(i, i + batchSize);
          await Promise.all(
            batch.map(async (item) => {
              try {
                const plaintext = await decryptData(item.encrypted, encryptionKey);
                decryptionCache.set(item._id, plaintext);
              } catch (err) {
                console.error(`Failed to decrypt ${item.title}:`, err);
                decryptionCache.set(item._id, 'Decryption Error');
              }
            })
          );
        }

        // Reveal all items
        const allRevealed = items.reduce((acc, item) => {
          acc[item._id] = true;
          return acc;
        }, {} as Record<string, boolean>);

        setRevealed(allRevealed);
      } catch (err) {
        console.error('Bulk decryption failed:', err);
        alert('Failed to decrypt some passwords');
      } finally {
        setLoading(prev => ({ ...prev, bulk: false }));
      }
    }
  }, [items, revealed, encryptionKey]);

  // Memoized item rendering for better performance
  const renderItem = useCallback((item: VaultItem) => {
    const isRevealed = revealed[item._id];
    const isLoading = loading[item._id];
    const cachedPassword = decryptionCache.get(item._id);

    return (
      <div key={item._id} className="border p-4 mb-2 rounded flex justify-between items-center">
        <div className="flex-1">
          <h2 className="font-semibold text-lg">{item.title}</h2>
          {item.username && <p className="text-gray-600">👤 {item.username}</p>}
          {item.url && (
            <p className="text-blue-600 truncate max-w-md">
              🔗 <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                {item.url}
              </a>
            </p>
          )}
          {item.notes && <p className="text-gray-500 text-sm mt-1">📝 {item.notes}</p>}
        </div>
        <div className="flex gap-2 items-center">
          <button
            className="px-3 py-2 bg-gray-200 dark:bg-muted rounded min-w-24 hover:bg-gray-300 transition-colors disabled:opacity-50"
            onClick={() => toggleReveal(item)}
            disabled={isLoading || loading.bulk}
            title={isRevealed ? "Hide password" : "Reveal password"}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-1"></div>
                ...
              </span>
            ) : isRevealed ? (
              <span className="font-mono text-sm">{cachedPassword}</span>
            ) : (
              '••••••'
            )}
          </button>
          <button
            className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center gap-2"
            onClick={() => handleEdit(item)}
            disabled={loading.bulk}
            title="Edit item"
          >
            <Edit size={16} /> Edit
          </button>
          <button
            className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            onClick={() => handleDelete(item._id)}
            title="Delete item"
          >
            🗑️ Delete
          </button>
        </div>
      </div>
    );
  }, [toggleReveal, handleDelete, handleEdit, revealed, loading]);

  // Show loading state until component is mounted
  if (!mounted) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">🔐 Your Vault</h1>
        </div>
        <div className="text-center text-gray-500 mt-10">
          <p className="text-lg font-medium">Loading vault...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">🔐 Your Vault</h1>
        {items.length > 0 && (
          <button
            onClick={toggleRevealAll}
            disabled={loading.bulk || editingItem !== null}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {loading.bulk ? (
              <span className="flex items-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Processing...
              </span>
            ) : Object.values(revealed).some(Boolean) ? (
              '👁️ Hide All'
            ) : (
              '👁️ Reveal All'
            )}
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center text-gray-500 mt-10">
          <p className="text-lg font-medium">🔒 No items in your vault yet.</p>
          <p className="text-sm text-gray-400 mt-1">
            Add your first password, note, or credential to get started!
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-gray-600">
            Showing {items.length} items • {revealedItems.length} revealed • {decryptionCache.size} cached
            {editingItem && <span className="ml-2 text-blue-600">• Editing mode active</span>}
          </div>
          <div className="space-y-3">
            {items.map(renderItem)}
          </div>
        </>
      )}

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
          <div className="bg-white dark:bg-muted dark:text-white rounded-xl p-6 w-full max-w-2xl shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-blue-700">
                ✏️ Edit: {editingItem.title}
              </h3>
              <button
                onClick={handleCancelEdit}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                title="Close"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter title"
                    value={editForm.title}
                    onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    placeholder="Enter username"
                    value={editForm.username}
                    onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com"
                    value={editForm.url}
                    onChange={(e) => setEditForm(prev => ({ ...prev, url: e.target.value }))}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter password"
                    value={editForm.password}
                    onChange={(e) => setEditForm(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  placeholder="Add any notes here..."
                  value={editForm.notes}
                  onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={handleCancelEdit}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2 font-medium"
              >
                <X size={18} /> Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={loading[editingItem._id] || !editForm.title || !editForm.password}
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center gap-2 font-medium"
              >
                <Save size={18} /> {loading[editingItem._id] ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VaultPannel;