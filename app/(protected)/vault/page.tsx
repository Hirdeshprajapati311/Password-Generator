'use client'
import { AddVaultItemForm } from '@/components/AddVaultItemForm';
import VaultPannel from '@/components/VaultPannel';
import { generateEncryptionKey } from '@/lib/crypto';
import React, { useEffect, useState } from 'react';

const VaultPage = () => {

  const [encryptionKey, setEncryptionKey] = useState<string | null>(null)
  


  useEffect(() => {

    const key = localStorage.getItem('vaultKey');
    if (key){
      setEncryptionKey(key);
    } else {
      const newKey = generateEncryptionKey();
      localStorage.setItem('vaultKey', newKey);
      setEncryptionKey(newKey)
    }
  }, [])
  
  if(!encryptionKey) return <p>Loading...</p>

  return (
    <div>
      
      <AddVaultItemForm encryptionKey={encryptionKey} />
      <VaultPannel  encryptionKey={encryptionKey} />
    </div>
  );
}

export default VaultPage;
