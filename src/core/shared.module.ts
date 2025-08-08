import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { LoggerService } from './middlewares/logger.middleware';
import { MorganMiddleware } from './middlewares/morgan.middleware';
import { ConfigModule } from '@nestjs/config';
import { EncryptionService } from './services/encryption.service';
import { EncryptionInterceptor } from './interceptors/encryption.interceptor';

@Module({
  imports: [ConfigModule],
  providers: [LoggerService, EncryptionService, EncryptionInterceptor],
  exports: [LoggerService, EncryptionService, EncryptionInterceptor],
})
export class SharedModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MorganMiddleware).forRoutes('*');
  }
}
