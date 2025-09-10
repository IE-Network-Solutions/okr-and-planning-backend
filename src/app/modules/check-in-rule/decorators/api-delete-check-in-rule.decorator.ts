import { applyDecorators, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function apiDeleteCheckInRule() {
  return applyDecorators(
    HttpCode(HttpStatus.NO_CONTENT),
    ApiOperation({ summary: 'Delete a check-in rule' }),
    ApiResponse({
      status: HttpStatus.NO_CONTENT,
      description: 'Check-in rule deleted successfully',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Check-in rule not found',
    }),
  );
} 