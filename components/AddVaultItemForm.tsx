import { useState } from 'react';
import { encryptData } from '@/lib/crypto';
import { useVaultStore } from '@/store/useVaultStore';

interface AddVaultItemFormProps {
  encryptionKey: string;
}

export const AddVaultItemForm = ({ encryptionKey }: AddVaultItemFormProps) => {
  const { fetchVault } = useVaultStore();

  const [title, setTitle] = useState('');
  const [username, setUsername] = useState('');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !password) {
      alert('Title and Password are required!');
      return;
    }

    // Encrypt password
    const encrypted = await encryptData(password, encryptionKey);

    // POST to backend
    const res = await fetch('/api/vault', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, username, url, notes, encrypted }),
    });

    if (!res.ok) {
      alert('Failed to add item');
      return;
    }

    // Refresh vault panel
    fetchVault();

    // Clear form
    setTitle('');
    setUsername('');
    setUrl('');
    setNotes('');
    setPassword('');
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded space-y-2">
      <h2 className="font-bold text-lg mb-2">Add New Vault Item</h2>
      <input
        className="w-full border px-2 py-1 rounded"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <input
        className="w-full border px-2 py-1 rounded"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        className="w-full border px-2 py-1 rounded"
        placeholder="URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <textarea
        className="w-full border px-2 py-1 rounded"
        placeholder="Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <input
        type="password"
        className="w-full border px-2 py-1 rounded"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit" className="bg-blue-500 text-white px-4 py-1 rounded">
        Add Item
      </button>
    </form>
  );
};
