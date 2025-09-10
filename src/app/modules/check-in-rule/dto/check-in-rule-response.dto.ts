import { ApiProperty } from '@nestjs/swagger';
import { AppliesTo } from '../enum/applies-to.enum';
import { Operation } from '../enum/operation.enum';

export class TargetDateResponseDto {
  @ApiProperty({ description: 'Day this rule applies to', example: 'monday' })
  date: string;

  @ApiProperty({ description: 'Start day of the week', example: 'monday' })
  startDay: string;

  @ApiProperty({ description: 'Start time of day', example: '03:00' })
  startTime: string;

  @ApiProperty({ description: 'End day of the week', example: 'monday' })
  endDay: string;

  @ApiProperty({ description: 'End time of day', example: '03:00' })
  endTime: string;
}

export class CheckInRuleResponseDto {
  @ApiProperty({ description: 'Unique identifier' })
  id: string;

  @ApiProperty({ description: 'Name of the check-in rule' })
  name: string;

  @ApiProperty({ description: 'Description of the check-in rule', required: false })
  description?: string;

  @ApiProperty({ description: 'What this rule applies to', enum: AppliesTo })
  appliesTo: AppliesTo;

  @ApiProperty({ description: 'Planning period ID' })
  planningPeriodId: string;

  @ApiProperty({ description: 'Whether this rule is time-based' })
  timeBased: boolean;

  @ApiProperty({ description: 'Whether this rule is achievement-based' })
  achievementBased: boolean;

  @ApiProperty({ description: 'Frequency of the check-in' })
  frequency: number;

  @ApiProperty({ description: 'Operation to perform', enum: Operation, required: false })
  operation?: Operation;

  @ApiProperty({ description: 'Tenant ID' })
  tenantId: string;

  @ApiProperty({ description: 'Category ID' })
  categoryId: string;

  @ApiProperty({ description: 'Feedback type ID' })
  feedbackId: string;

  @ApiProperty({ description: 'Target value for achievement-based rules', required: false })
  target?: number;

  @ApiProperty({ 
    description: 'Array of user IDs this rule applies to',
    type: [String],
    example: ['user1', 'user2', 'user3']
  })
  userIds?: string[];

  @ApiProperty({ 
    description: 'Target dates and times for time-based rules', 
    required: false, 
    type: 'array',
    items: {
      type: 'object',
      properties: {
        date: { type: 'string', example: 'monday' },
        startDay: { type: 'string', example: 'monday' },
        startTime: { type: 'string', example: '03:00' },
        endDay: { type: 'string', example: 'monday' },
        endTime: { type: 'string', example: '03:00' }
      }
    }
  })
  targetDate?: TargetDateResponseDto[];

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;

  @ApiProperty({ description: 'Deletion timestamp', required: false })
  deletedAt?: Date;

  @ApiProperty({ description: 'User who created the record', required: false })
  createdBy?: string;

  @ApiProperty({ description: 'User who last updated the record', required: false })
  updatedBy?: string;
} 