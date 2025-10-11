import { useState } from 'react';
import { encryptData } from '@/lib/crypto';
import { useVaultStore } from '@/store/useVaultStore';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface AddVaultItemFormProps {
  masterKey: string;
}

export const AddVaultItemForm = ({ masterKey }: AddVaultItemFormProps) => {
  const { fetchVault } = useVaultStore();

  const [title, setTitle] = useState('');
  const [username, setUsername] = useState('');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !password) {
      alert('Title and Password are required!');
      return;
    }

    // Encrypt password
    const encrypted = await encryptData(password, masterKey);

    // POST to backend
    const res = await fetch('/api/vault', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, username, url, notes, encrypted }),
    });
    toast.success("Vault item added")

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
        className="w-full dark:bg-gray-800 border px-2 py-1 rounded"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <input
        className="w-full dark:bg-gray-800 border px-2 py-1 rounded"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        className="w-full dark:bg-gray-800 border px-2 py-1 rounded"
        placeholder="URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <textarea
        className="w-full dark:bg-gray-800 border px-2 py-1 rounded"
        placeholder="Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <div className="relative w-full">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border dark:bg-gray-800 border-gray-300 p-3 rounded-lg focus:ring-2 dark:text-white focus:ring-blue-500 focus:border-transparent font-mono pr-10"
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
      <button type="submit" className="bg-blue-500 text-white px-4 py-1 rounded">
        Add Item
      </button>
    </form>
  );
};
