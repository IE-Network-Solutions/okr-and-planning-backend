import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { CheckInRuleResponseDto } from '../dto/check-in-rule-response.dto';

export function ApiGetCheckInRules() {
  return applyDecorators(
    ApiOperation({ summary: 'Get all check-in rules for a tenant' }),
    ApiQuery({ name: 'tenantId', description: 'Tenant ID', type: 'string' }),
    ApiResponse({
      status: 200,
      description: 'List of check-in rules retrieved successfully',
      type: [CheckInRuleResponseDto],
    }),
  );
} 