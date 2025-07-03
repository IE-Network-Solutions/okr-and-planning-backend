import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EncryptionService {

  private readonly algorithm: string;
  private readonly key: Buffer;
  private readonly salt: string;
  private readonly iv: Buffer;

  constructor(private configService: ConfigService) {

    this.algorithm = this.configService.get<string>('encryption.algorithm') || 'aes-256-gcm';
    this.salt = this.configService.get<string>('encryption.salt') || 'default-salt';
    const encryptionKey = this.configService.get<string>('encryption.key');
    if (!encryptionKey) {
      throw new Error('ENCRYPTION_KEY environment variable is not set');
    }
    
    const ivHex = this.configService.get<string>('encryption.iv');
    if (!ivHex) {
      throw new Error('ENCRYPTION_IV environment variable is not set');
    }
    
    // Use PBKDF2 to match frontend key derivation
    // Frontend converts hex salt to string, so we need to do the same
    const saltString = Buffer.from(this.salt, 'hex').toString('utf8');
    this.key = crypto.pbkdf2Sync(encryptionKey, saltString, 1000, 32, 'sha256');
    this.iv = Buffer.from(ivHex, 'hex');
  }

  // Encryption methods
  encryptText(text: string): string {
    const cipher = crypto.createCipheriv(this.algorithm, this.key, this.iv) as crypto.CipherGCM;
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // For AES-GCM, we need to include the auth tag
    const authTag = cipher.getAuthTag();
    const encryptedWithTag = encrypted + authTag.toString('hex');
    
    return `${this.iv.toString('hex')}:${encryptedWithTag}`;
  }

  encryptObject(obj: any): string {
    const jsonString = JSON.stringify(obj);
    return this.encryptText(jsonString);
  }

  // Decryption methods
  decryptText(encryptedText: string): string {
    const [ivHex, encryptedDataWithTag] = encryptedText.split(':');
    if (!ivHex || !encryptedDataWithTag) {
      throw new Error('Invalid encrypted text format');
    }
    
    // For Web Crypto API AES-GCM, the auth tag is appended to the ciphertext
    // The auth tag is 16 bytes (32 hex characters) at the end
    const authTagLength = 32; // 16 bytes = 32 hex characters
    const encryptedData = encryptedDataWithTag.slice(0, -authTagLength);
    const authTagHex = encryptedDataWithTag.slice(-authTagLength);
    
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv) as crypto.DecipherGCM;
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  decryptObject(encryptedText: string): any {
    const decryptedText = this.decryptText(encryptedText);
    return JSON.parse(decryptedText);
  }

  // Utility methods
  isEncrypted(text: string): boolean {
    try {
      const parts = text.split(':');
      
      if (parts.length !== 2) {
        return false;
      }
      
      const [ivHex, encryptedDataWithTag] = parts;
      if (!ivHex || !encryptedDataWithTag) {
        return false;
      }
      
      // For AES-GCM, the encrypted data should be at least 32 characters (16 bytes for auth tag)
      if (encryptedDataWithTag.length < 32) {
        return false;
      }
      
      // Try to parse as hex
      Buffer.from(ivHex, 'hex');
      Buffer.from(encryptedDataWithTag, 'hex');
      
      return true;
    } catch (error) {
      return false;
    }
  }
} 