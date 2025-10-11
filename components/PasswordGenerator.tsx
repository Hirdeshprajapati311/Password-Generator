"use client";
import { encryptData } from "@/lib/crypto";
import React, { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

const PasswordGenerator = () => {
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

  const clearClipboardTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (clearClipboardTimeoutRef.current) {
        clearTimeout(clearClipboardTimeoutRef.current);
      }
    };
  }, []);

  const generatePassword = () => {
    let charset = "";
    if (includeUppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (includeLowercase) charset += "abcdefghijklmnopqrstuvwxyz";
    if (includeNumbers) charset += "0123456789";
    if (includeSymbols) charset += "!@#$%^&*()_+[]{}<>?,.";

    if (!charset) {
      alert("Please select at least one option!");
      return;
    }

    let newPassword = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      newPassword += charset[randomIndex];
    }

    setPassword(newPassword);
  };

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

    } catch  {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleSaveToVault = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password) {
      toast.error("No password to Save");
      return;
    }

    try {
      // Get or create encryption key
      const key = localStorage.getItem("vaultKey");
      if (!key ) {
        toast.error("No encryption key found. Please log in again.");
        return;
      }

      console.log('PasswordGenerator - Saving with key:', {
        keyLength: key?.length,
        key: key?.substring(0, 10) + '...'
      });
      // FIXED: Add await since encryptData is now async
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
      setVaultTitle("New Password");
      setVaultUsername("");
      setVaultUrl("");
      setVaultNotes("");
    } catch (err: unknown) {

      const errorMessage = err instanceof Error?err.message:String(err)
      console.error("Save to vault error:", errorMessage);
      toast.error(errorMessage || "Error saving password")
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 dark:bg-gray-800  bg-white shadow-md rounded-2xl p-6 text-center">
      <h2 className="text-xl font-bold mb-4">🔐 Password Generator</h2>

      <div className="flex flex-col gap-3 text-left">
        <label className="flex justify-between">
          <span>Length: {length}</span>
          <input
            type="range"
            min="6"
            max="32"
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-1/2"
          />
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={includeUppercase}
            onChange={(e) => setIncludeUppercase(e.target.checked)}
          />
          Include Uppercase (A–Z)
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={includeLowercase}
            onChange={(e) => setIncludeLowercase(e.target.checked)}
          />
          Include Lowercase (a–z)
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={includeNumbers}
            onChange={(e) => setIncludeNumbers(e.target.checked)}
          />
          Include Numbers (0–9)
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={includeSymbols}
            onChange={(e) => setIncludeSymbols(e.target.checked)}
          />
          Include Symbols (!@#...)
        </label>
      </div>

      <button
        onClick={generatePassword}
        className="w-full mt-5 cursor-pointer bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
      >
        Generate Password
      </button>

      {password && (
        <div className="mt-4 space-y-2">
          <div className="flex justify-between items-center border p-2 rounded-lg">
            <span className="truncate font-mono">{password}</span>
            <button
              onClick={copyToClipboard}
              className="text-blue-500 hover:underline cursor-pointer ml-2"
            >
              Copy
            </button>
          </div>

          {password &&
            <button
              onClick={() => setIsModalOpen(!isModalOpen)}
              className="w-full mt-2 cursor-pointer bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Save in Vault
            </button>
          }

          {isModalOpen && (
            <div className="fixed inset-0 bg-black/70 dark:bg-black/10 flex justify-center items-center z-50">
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-80 shadow-lg">
                <h3 className="text-lg font-bold mb-4">Save Password to Vault</h3>

                <form noValidate onSubmit={handleSaveToVault} className="flex flex-col gap-3">
                  <input
                    type="text"
                    placeholder="Title"
                    value={vaultTitle}
                    onChange={(e) => setVaultTitle(e.target.value)}
                    className="border dark:bg-gray-700 p-2 rounded"
                    required
                  />

                  <input
                    type="text"
                    placeholder="Username (optional)"
                    value={vaultUsername}
                    onChange={(e) => setVaultUsername(e.target.value)}
                    className="border dark:bg-gray-700 p-2 rounded"
                  />

                  <input
                    type="url"
                    placeholder="URL (optional)"
                    value={vaultUrl}
                    onChange={(e) => setVaultUrl(e.target.value)}
                    className="border dark:bg-gray-700 p-2 rounded"
                  />

                  <textarea
                    placeholder="Notes (optional)"
                    value={vaultNotes}
                    onChange={(e) => setVaultNotes(e.target.value)}
                    className="border dark:bg-gray-700 p-2 rounded"
                  />

                  <input
                    type="text"
                    value={password} // pre-filled password
                    readOnly
                    className="border dark:bg-gray-700 p-2 rounded font-mono"
                  />

                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-3 py-1 rounded bg-gray-300 dark:bg-gray-700 hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Save
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}


        </div>
      )}
    </div>
  );
};

export default PasswordGenerator;