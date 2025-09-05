import { ApiProperty } from '@nestjs/swagger';
import { AppliesTo } from '../enum/applies-to.enum';
import { Operation } from '../enum/operation.enum';

export class TargetDateResponseDto {
  @ApiProperty({ description: 'Day of the week', example: 'Monday' })
  date: string;

  @ApiProperty({ description: 'Day ID', example: '9001b1a8-786e-4707-932e-40277df869d9', required: false })
  dayId?: string;

  @ApiProperty({ description: 'Start time of day', example: '07:30' })
  start: string;

  @ApiProperty({ description: 'End time of day', example: '17:30' })
  end: string;
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

  @ApiProperty({ description: 'Work schedule ID', required: false })
  workScheduleId?: string;

  @ApiProperty({ description: 'Category ID' })
  categoryId: string;

  @ApiProperty({ description: 'Feedback type ID' })
  feedbackId: string;

  @ApiProperty({ description: 'Target value for achievement-based rules', required: false })
  target?: number;

  @ApiProperty({ 
    description: 'Target dates and times for time-based rules', 
    required: false, 
    type: 'array',
    items: {
      type: 'object',
      properties: {
        date: { type: 'string', example: 'Monday' },
        dayId: { type: 'string', example: '9001b1a8-786e-4707-932e-40277df869d9' },
        start: { type: 'string', example: '07:30' },
        end: { type: 'string', example: '17:30' }
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