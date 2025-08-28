import { applyDecorators, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';

export function ApiDeleteCheckInRule() {
  return applyDecorators(
    HttpCode(HttpStatus.NO_CONTENT),
    ApiOperation({ summary: 'Delete a check-in rule' }),
    ApiParam({ name: 'id', description: 'Check-in rule ID' }),
    ApiQuery({ name: 'tenantId', description: 'Tenant ID', type: 'string' }),
    ApiResponse({
      status: HttpStatus.NO_CONTENT,
      description: 'Check-in rule deleted successfully',
    }),
    ApiResponse({
      status: 404,
      description: 'Check-in rule not found',
    }),
  );
} 