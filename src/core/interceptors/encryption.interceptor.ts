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
    // console.log("Original request body:", request.body);
    // Handle request body
    if (request.body) {
      // If body is a string, try to decrypt it
      if (typeof request.body === 'string') {
        // console.log("Processing string body:", request.body);
        if (this.encryptionService.isEncrypted(request.body)) {
          try {
            const decrypted = this.encryptionService.decryptObject(request.body);
            request.body = decrypted;
            // console.log("Successfully decrypted request body:", request.body);
          } catch (error) {
            // console.error("Failed to decrypt request body:", error.message);
            throw new BadRequestException('Invalid encrypted data format');
          }
        } else {
          // console.log("Body is a string but not encrypted, using as is");
        }
      } else if (typeof request.body === 'object') {
        // console.log("Body is an object, checking if it contains encrypted data");
        // Check if the object has a single property that might be encrypted
        const keys = Object.keys(request.body);
        if (keys.length === 1 && typeof request.body[keys[0]] === 'string') {
          const value = request.body[keys[0]];
          if (this.encryptionService.isEncrypted(value)) {
            try {
              const decrypted = this.encryptionService.decryptObject(value);
              request.body = decrypted;
              // console.log("Successfully decrypted object property:", request.body);
            } catch (error) {
              // console.error("Failed to decrypt object property:", error.message);
              throw new BadRequestException('Invalid encrypted data format');
            }
          }
        }
      }
    }
    return next.handle().pipe(
      map(data => {
        // Encrypt response data
        if (data) {
          // console.log("Data before encryption:", data);
          return this.encryptionService.encryptObject(data);
        }
        return data;
      }),
    );
  }
} 