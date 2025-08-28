import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { CheckInRuleResponseDto } from '../dto/check-in-rule-response.dto';

export function ApiUpdateCheckInRule() {
  return applyDecorators(
    ApiOperation({ summary: 'Update a check-in rule' }),
    ApiParam({ name: 'id', description: 'Check-in rule ID' }),
    ApiQuery({ name: 'tenantId', description: 'Tenant ID', type: 'string' }),
    ApiResponse({
      status: 200,
      description: 'Check-in rule updated successfully',
      type: CheckInRuleResponseDto,
    }),
    ApiResponse({
      status: 404,
      description: 'Check-in rule not found',
    }),
    ApiResponse({
      status: 400,
      description: 'Invalid input data',
    }),
  );
} 