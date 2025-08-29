import { applyDecorators, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { CheckInRuleResponseDto } from '../dto/check-in-rule-response.dto';

export function apiGetCheckInRule() {
  return applyDecorators(
    HttpCode(HttpStatus.OK),
    ApiOperation({ summary: 'Get a check-in rule by ID' }),
    ApiParam({ name: 'id', description: 'Check-in rule ID' }),
    ApiQuery({ name: 'tenantId', description: 'Tenant ID', type: 'string' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Check-in rule retrieved successfully',
      type: CheckInRuleResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Check-in rule not found',
    }),
  );
} 