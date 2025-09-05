import { IsString, IsEnum, IsUUID, IsBoolean, IsInt, IsOptional, Min, MaxLength, IsNumber, IsArray, ValidateNested, ValidateIf } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { AppliesTo } from '../enum/applies-to.enum';
import { Operation } from '../enum/operation.enum';

export class TargetDateDto {
  @ApiProperty({ description: 'Day of the week', example: 'Monday' })
  @IsString()
  date: string;

  @ApiProperty({ description: 'Day ID', example: '9001b1a8-786e-4707-932e-40277df869d9', required: false })
  @IsOptional()
  @IsString()
  dayId?: string;

  @ApiProperty({ description: 'Start time of day', example: '07:30', required: false })
  @ValidateIf((o) => !o.time)
  @IsString()
  startTime?: string;

  @ApiProperty({ description: 'End time of day', example: '17:30', required: false })
  @ValidateIf((o) => !o.time)
  @IsString()
  endTime?: string;

  @ApiProperty({ description: 'Start time of day (alternative field)', example: '07:30', required: false })
  @ValidateIf((o) => !o.startTime && !o.time)
  @IsString()
  start?: string;

  @ApiProperty({ description: 'End time of day (alternative field)', example: '17:30', required: false })
  @ValidateIf((o) => !o.endTime && !o.time)
  @IsString()
  end?: string;

  @ApiProperty({ description: 'Time of day (legacy field)', example: '9:00', required: false })
  @ValidateIf((o) => !o.startTime && !o.endTime && !o.start && !o.end)
  @IsString()
  time?: string;
}

export class CreateCheckInRuleDto {
  @ApiProperty({ description: 'Name of the check-in rule', maxLength: 500 })
  @IsString()
  @MaxLength(500)
  name: string;

  @ApiProperty({ description: 'Description of the check-in rule', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'What this rule applies to', enum: AppliesTo })
  @IsEnum(AppliesTo)
  appliesTo: AppliesTo;

  @ApiProperty({ description: 'Planning period ID' })
  @IsUUID()
  planningPeriodId: string;

  @ApiProperty({ description: 'Whether this rule is time-based' })
  @IsBoolean()
  timeBased: boolean;

  @ApiProperty({ description: 'Whether this rule is achievement-based' })
  @IsBoolean()
  achievementBased: boolean;

  @ApiProperty({ description: 'Frequency of the check-in', minimum: 1 })
  @IsInt()
  @Min(1)
  frequency: number;

  @ApiProperty({ description: 'Operation to perform', enum: Operation, required: false })
  @IsOptional()
  @IsEnum(Operation)
  operation?: Operation;

  @ApiProperty({ description: 'Tenant ID' })
  @IsUUID()
  tenantId: string;

  @ApiProperty({ description: 'Work schedule ID', required: false })
  @IsOptional()
  @IsUUID()
  workScheduleId?: string;

  @ApiProperty({ description: 'Category ID' })
  @IsUUID()
  categoryId: string;

  @ApiProperty({ description: 'Feedback type ID' })
  @IsUUID()
  feedbackId: string;

  @ApiProperty({ description: 'Target value for achievement-based rules', required: false, type: 'number' })
  @IsOptional()
  @IsNumber()
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
        startTime: { type: 'string', example: '07:30' },
        endTime: { type: 'string', example: '17:30' }
      }
    }
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TargetDateDto)
  targetDate?: TargetDateDto[];
} 