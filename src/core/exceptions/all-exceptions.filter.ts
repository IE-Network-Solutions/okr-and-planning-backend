import {
  Catch,
  ArgumentsHost,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { BaseExceptionFilter, HttpAdapterHost } from '@nestjs/core';
import { LoggerService } from '../middlewares/logger.middleware';
import { TypeORMError } from 'typeorm';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  constructor(
    applicationRef: HttpAdapterHost,
    private readonly loggerService?: LoggerService,
  ) {
    super(applicationRef.httpAdapter);
  }
  catch(exception: unknown, host: ArgumentsHost) {
    if (exception instanceof TypeORMError) {
      const response = host.switchToHttp().getResponse();
      const status = HttpStatus.BAD_REQUEST;
      this.logError(exception, status);
      // Provide user-friendly database error messages
      let userMessage =
        'An error occurred while processing your request. Please try again.';
      // Handle specific database errors with user-friendly messages
      if (exception.message.includes('duplicate key')) {
        userMessage =
          'This record already exists. Please use a different value.';
      } else if (exception.message.includes('foreign key constraint')) {
        userMessage =
          'This operation cannot be completed because it references data that no longer exists.';
      } else if (exception.message.includes('not null constraint')) {
        userMessage = 'Please provide all required information.';
      } else if (exception.message.includes('unique constraint')) {
        userMessage =
          'This value must be unique. Please choose a different option.';
      }
      response.status(status).json({
        statusCode: status,
        message: userMessage,
        error: 'Data Processing Error',
      });
    } else {
      super.catch(exception, host);
      const status =
        exception instanceof HttpException
          ? exception.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR;
      this.logError(exception, status);
    }
  }
  private logError(exception: unknown, status: number) {
    const errorMessage =
      exception instanceof Error
        ? exception.message
        : 'An unexpected error occurred';
    const errorStack = exception instanceof Error ? exception.stack : '';

    if (status >= 400) {
      this.loggerService.error(errorMessage, errorStack);
    }
  }
}
