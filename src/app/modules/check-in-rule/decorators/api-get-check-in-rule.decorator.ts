import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { CheckInRuleResponseDto } from '../dto/check-in-rule-response.dto';

export function ApiGetCheckInRule() {
  return applyDecorators(
    ApiOperation({ summary: 'Get a specific check-in rule by ID' }),
    ApiParam({ name: 'id', description: 'Check-in rule ID' }),
    ApiQuery({ name: 'tenantId', description: 'Tenant ID', type: 'string' }),
    ApiResponse({
      status: 200,
      description: 'Check-in rule retrieved successfully',
      type: CheckInRuleResponseDto,
    }),
    ApiResponse({
      status: 404,
      description: 'Check-in rule not found',
    }),
  );
} 