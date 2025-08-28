import { applyDecorators, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CheckInRuleResponseDto } from '../dto/check-in-rule-response.dto';

export function ApiCreateCheckInRule() {
  return applyDecorators(
    HttpCode(HttpStatus.CREATED),
    ApiOperation({ summary: 'Create a new check-in rule' }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Check-in rule created successfully',
      type: CheckInRuleResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Invalid input data',
    }),
  );
} 