import { Injectable, NestInterceptor, ExecutionContext, CallHandler, BadRequestException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EncryptionService } from '../services/encryption.service';

@Injectable()
export class EncryptionInterceptor implements NestInterceptor {
  constructor(private readonly encryptionService: EncryptionService) {}
  
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    
    // Handle request body
    if (request.body) {
      // If body is a string, try to decrypt it
      if (typeof request.body === 'string') {
        if (this.encryptionService.isEncrypted(request.body)) {
          try {
            const decrypted = this.encryptionService.decryptObject(request.body);
            request.body = decrypted;
            //  console.log("✅ Decrypted value:", request.body);
          } catch (error) {
          //  console.error("❌ Failed to decrypt request body:", error.message);
            throw new BadRequestException('Invalid encrypted data format');
          }
        }
      } else if (typeof request.body === 'object') {
        // Check if the object has a single property that might be encrypted
        const keys = Object.keys(request.body);
                if (keys.length === 1 && typeof request.body[keys[0]] === 'string') {
          const value = request.body[keys[0]];
     
          if (this.encryptionService.isEncrypted(value)) {
            try {
              const decryptedText = this.encryptionService.decryptText(value);
              
              // Try to parse as JSON, if it fails, use the text as is
              try {
                const decrypted = JSON.parse(decryptedText);
                request.body = decrypted;
                // console.log("✅ Decrypted value:", request.body);
              } catch (jsonError) {
                // If JSON parsing fails, use the text as is
                request.body = decryptedText;
                // console.log("✅ Decrypted value:", request.body);
              }
            } catch (error) {
              // console.error("❌ Failed to decrypt object property:", error.message);
              throw new BadRequestException('Invalid encrypted data format');
            }
          } else {
            //console.log("ℹ️ Value is not encrypted, using as is");
          }
        }
      }
    }
    return next.handle().pipe(
      map(data => {
        // Encrypt response data
        if (data) {
          // console.log("📤 Data before encryption:", data);
          const encryptedData = this.encryptionService.encryptObject(data);
          // Wrap encrypted data in the format frontend expects
          return { data: encryptedData };
        }
        return data;
      }),
    );
  }
} 