import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from '@app/app.module';
import { setupSwagger } from '@config/swagger.config';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import { AllExceptionsFilter } from './core/exceptions/all-exceptions.filter';
import { LoggerService } from './core/middlewares/logger.middleware';
import * as bodyParser from 'body-parser';
import * as admin from 'firebase-admin';
import serviceAccount from './config/serviceAccount';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  const configService = app.get(ConfigService);
  app.setGlobalPrefix('api/v1');
  app.enableVersioning({ type: VersioningType.URI });

  const httpAdapterHost = app.get(HttpAdapterHost);
  const loggerService = app.get(LoggerService);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost, loggerService));

  app.useGlobalPipes(new ValidationPipe());

  app.use(helmet());
  app.enableCors();

  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount(configService) as any),
    });
  } catch (error) {
    throw error;
  }
  setupSwagger(app);
  app.use(cookieParser());

  const port = configService.get<number>('app.port');
  await app.listen(port);
}
bootstrap();
