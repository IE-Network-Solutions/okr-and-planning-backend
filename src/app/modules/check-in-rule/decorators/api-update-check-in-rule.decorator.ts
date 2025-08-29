import { applyDecorators, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { CheckInRuleResponseDto } from '../dto/check-in-rule-response.dto';

export function apiUpdateCheckInRule() {
  return applyDecorators(
    HttpCode(HttpStatus.OK),
    ApiOperation({ summary: 'Update a check-in rule' }),
    ApiParam({ name: 'id', description: 'Check-in rule ID' }),
    ApiQuery({ name: 'tenantId', description: 'Tenant ID', type: 'string' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Check-in rule updated successfully',
      type: CheckInRuleResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Check-in rule not found',
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Invalid input data',
    }),
  );
} 