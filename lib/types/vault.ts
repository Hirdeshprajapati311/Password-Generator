// lib/types/vault.ts
export interface EncryptedData {
  ciphertext: string;
  iv: string;
  tag: string;
  algorithm: string;
  salt:string
}

export interface VaultItem {
  _id: string;
  userId: string;
  title: string;
  encrypted: EncryptedData;
  username?: string;
  url?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  lastAccessedAt?: Date;
}

export interface CreateVaultItemDto {
  title: string;
  encrypted: EncryptedData;
  url?: string;
  username?: string;
  notes?: string;
}