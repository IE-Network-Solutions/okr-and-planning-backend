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

    this.algorithm = this.configService.get<string>('encryption.algorithm') || 'aes-256-cbc';
    this.salt = this.configService.get<string>('encryption.salt') || 'default-salt';
    const encryptionKey = this.configService.get<string>('encryption.key');
    if (!encryptionKey) {
      throw new Error('ENCRYPTION_KEY environment variable is not set');
    }
    
    const ivHex = this.configService.get<string>('encryption.iv');
    if (!ivHex) {
      throw new Error('ENCRYPTION_IV environment variable is not set');
    }
    
    this.key = crypto.scryptSync(encryptionKey, this.salt, 32);
    this.iv = Buffer.from(ivHex, 'hex');
  }

  // Encryption methods
  encryptText(text: string): string {
    const cipher = crypto.createCipheriv(this.algorithm, this.key, this.iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${this.iv.toString('hex')}:${encrypted}`;
  }

  encryptObject(obj: any): string {
    const jsonString = JSON.stringify(obj);
    return this.encryptText(jsonString);
  }

  // Decryption methods
  decryptText(encryptedText: string): string {
    const [ivHex, encryptedData] = encryptedText.split(':');
    if (!ivHex || !encryptedData) {
      throw new Error('Invalid encrypted text format');
    }
    
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
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
      if (parts.length !== 2) return false;
      
      const [ivHex, encryptedData] = parts;
      if (!ivHex || !encryptedData) return false;
      
      // Try to parse as hex
      Buffer.from(ivHex, 'hex');
      Buffer.from(encryptedData, 'hex');
      
      return true;
    } catch {
      return false;
    }
  }
} 