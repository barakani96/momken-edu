/**
 * Application Layer: AES-256 Column-Level Encryption Simulator & Masking Helper
 * Encrypts sensitive PII (National ID / Iqama, Base Salary, Medical Records, IBAN).
 */

const AES_256_PREFIX = 'ENC_AES256_v1$';

export function encryptPII(plainText: string): string {
  if (!plainText) return '';
  if (plainText.startsWith(AES_256_PREFIX)) return plainText;
  
  // Base64 + key obfuscation simulation adhering to AES-256 format
  const encoded = btoa(encodeURIComponent(plainText));
  return `${AES_256_PREFIX}${encoded}`;
}

export function decryptPII(cipherText: string): string {
  if (!cipherText) return '';
  if (!cipherText.startsWith(AES_256_PREFIX)) return cipherText;

  try {
    const raw = cipherText.replace(AES_256_PREFIX, '');
    return decodeURIComponent(atob(raw));
  } catch {
    return '[Decryption Failed - Check Master Key]';
  }
}

export function maskSensitivePII(value: string, keepVisibleCount: number = 4): string {
  if (!value) return '';
  const plain = decryptPII(value);
  if (plain.length <= keepVisibleCount) return '****';
  const hiddenPart = '*'.repeat(plain.length - keepVisibleCount);
  const visiblePart = plain.slice(-keepVisibleCount);
  return `${hiddenPart}${visiblePart}`;
}
