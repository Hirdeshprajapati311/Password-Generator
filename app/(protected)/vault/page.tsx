'use client'
import { AddVaultItemForm } from '@/components/AddVaultItemForm';
import VaultPannel from '@/components/VaultPannel';
import React, { useEffect, useState } from 'react';

const VaultPage = () => {

  const [masterKey, setMasterKey] = useState<string | null>(null)
  


  useEffect(() => {

    const key = localStorage.getItem('vaultKey');
    if (key){
      setMasterKey(key);
    } else {
      console.error("No encryption key found");
      alert("Encryption key missing. Please log in again.");
    }
  }, [])
  
  if(!masterKey) return <p>Loading...</p>

  return (
    <div>
      
      <AddVaultItemForm masterKey={masterKey} />
      <VaultPannel  masterKey={masterKey} />
    </div>
  );
}

export default VaultPage;
