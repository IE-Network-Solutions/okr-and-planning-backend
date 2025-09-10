import { applyDecorators, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { CheckInRuleResponseDto } from '../dto/check-in-rule-response.dto';

export function apiGetCheckInRules() {
  return applyDecorators(
    HttpCode(HttpStatus.OK),
    ApiOperation({ summary: 'Get all check-in rules' }),
    ApiQuery({ name: 'tenantId', description: 'Tenant ID', type: 'string' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Check-in rules retrieved successfully',
      type: [CheckInRuleResponseDto],
    }),
  );
} 