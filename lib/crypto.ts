// ...existing code...
import { EncryptedData } from './types/vault';

const isNode = typeof window === 'undefined' && typeof process !== 'undefined' && !!process.versions?.node;

const hexToUint8 = (hex: string) => {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16);
  return out;
};

const uint8ToHex = (u: Uint8Array) => Array.from(u).map(b => b.toString(16).padStart(2, '0')).join('');


// Add this validation function
const validateEncryptedData = (data: unknown): data is EncryptedData => {

  if (!data || typeof data !== "object") return false;
  const encrypted = data as EncryptedData
  return (
    data &&
    typeof encrypted.ciphertext === 'string' &&
    typeof encrypted.iv === 'string' &&
    typeof encrypted.salt === 'string' &&
    typeof encrypted.tag === 'string' &&
    encrypted.algorithm === 'aes-256-gcm' &&
    encrypted.ciphertext.length > 0 &&
    encrypted.iv.length === 32 && // 16 bytes in hex
    encrypted.salt.length === 32 && // 16 bytes in hex
    encrypted.tag.length === 32 // 16 bytes in hex
  );
};


export const generateEncryptionKey = (): string => {
  if (isNode) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const cryptoNode = require('crypto');
    return cryptoNode.randomBytes(32).toString('hex');
  } else {
    const buf = crypto.getRandomValues(new Uint8Array(32));
    return uint8ToHex(buf);
  }
};

async function deriveRawKeyBytes(password: string, saltHex: string): Promise<Uint8Array> {
  if (isNode) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const cryptoNode = require('crypto');
    const derived = cryptoNode.pbkdf2Sync(password, Buffer.from(saltHex, 'hex'), 100000, 32, 'sha256');
    return new Uint8Array(derived);
  } else {
    const enc = new TextEncoder();
    const pwKey = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', hash: 'SHA-256', salt: hexToUint8(saltHex), iterations: 100000 },
      pwKey,
      32 * 8
    );
    return new Uint8Array(bits);
  }
}

export const encryptData = async (data: string, userPassword: string): Promise<EncryptedData> => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const saltArr = isNode ? require('crypto').randomBytes(16) : crypto.getRandomValues(new Uint8Array(16));
  const saltHex = uint8ToHex(new Uint8Array(saltArr));
  const keyBytes = await deriveRawKeyBytes(userPassword, saltHex);

  if (isNode) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const cryptoNode = require('crypto');
    const iv = cryptoNode.randomBytes(16);
    const cipher = cryptoNode.createCipheriv('aes-256-gcm', Buffer.from(keyBytes), iv);
    const encrypted = Buffer.concat([cipher.update(Buffer.from(data, 'utf8')), cipher.final()]);
    const tag = cipher.getAuthTag();
    return {
      ciphertext: encrypted.toString('hex'),
      iv: iv.toString('hex'),
      salt: saltHex,
      tag: tag.toString('hex'),
      algorithm: 'aes-256-gcm',
    };
  } else {
    const iv = crypto.getRandomValues(new Uint8Array(16));
    
    const keyBuffer = keyBytes.slice().buffer; // Use slice() to ensure we get a regular ArrayBuffer
    
    const cryptoKey = await crypto.subtle.importKey('raw', keyBuffer, 'AES-GCM', false, ['encrypt']);
  
    const enc = new TextEncoder();
    const result = new Uint8Array(await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv }, 
      cryptoKey, 
      enc.encode(data)
    ));
    
    const tagLen = 16;
    const ct = result.slice(0, result.length - tagLen);
    const tag = result.slice(result.length - tagLen);
    
    return {
      ciphertext: uint8ToHex(ct),
      iv: uint8ToHex(iv),
      salt: saltHex,
      tag: uint8ToHex(tag),
      algorithm: 'aes-256-gcm',
    };
  }
};

export const decryptData = async (encryptedData: EncryptedData, userPassword: string): Promise<string> => {

  if (!validateEncryptedData(encryptedData)) {
    console.error('Invalid encrypted data structure:', encryptedData);
    throw new Error('Invalid encrypted data structure');
  }

  
  if (!encryptedData?.ciphertext || !encryptedData?.iv || !encryptedData?.salt || !encryptedData?.tag) {
    throw new Error('Missing required encryption fields');
  }

   console.log('Decryption debug:', {
    hasPassword: !!userPassword,
    passwordLength: userPassword?.length,
    salt: encryptedData.salt?.substring(0, 10) + '...',
    iv: encryptedData.iv?.substring(0, 10) + '...',
    tag: encryptedData.tag?.substring(0, 10) + '...',
    ciphertextLength: encryptedData.ciphertext?.length
  });

  const keyBytes = await deriveRawKeyBytes(userPassword, encryptedData.salt);

  if (isNode) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const cryptoNode = require('crypto');
    const iv = Buffer.from(encryptedData.iv, 'hex');
    const tag = Buffer.from(encryptedData.tag, 'hex');
    const ciphertext = Buffer.from(encryptedData.ciphertext, 'hex');
    const decipher = cryptoNode.createDecipheriv('aes-256-gcm', Buffer.from(keyBytes), iv);
    decipher.setAuthTag(tag);
    const out = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return out.toString('utf8');
  } else {
    const iv = hexToUint8(encryptedData.iv);
    const ct = hexToUint8(encryptedData.ciphertext);
    const tag = hexToUint8(encryptedData.tag);
    
    // Combine ciphertext and tag for Web Crypto API
    const combined = new Uint8Array(ct.length + tag.length);
    combined.set(ct);
    combined.set(tag, ct.length);
    
    // FIXED: Create a guaranteed ArrayBuffer (not SharedArrayBuffer)
    const keyBuffer = keyBytes.slice().buffer; // Use slice() to ensure we get a regular ArrayBuffer
    
    const cryptoKey = await crypto.subtle.importKey('raw', keyBuffer, 'AES-GCM', false, ['decrypt']);
    
    const dec = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv }, 
      cryptoKey, 
      combined
    );
    
    return new TextDecoder().decode(dec);
  }
};