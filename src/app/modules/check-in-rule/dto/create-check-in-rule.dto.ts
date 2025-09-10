import { IsString, IsEnum, IsUUID, IsBoolean, IsInt, IsOptional, Min, MaxLength, IsNumber, IsArray, ValidateNested, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { AppliesTo } from '../enum/applies-to.enum';
import { Operation } from '../enum/operation.enum';

export class TargetDateDto {
  @ApiProperty({ description: 'Day this rule applies to', example: 'monday' })
  @IsString()
  date: string;

  @ApiProperty({ description: 'Start day of the week', example: 'monday' })
  @IsString()
  startDay: string;

  @ApiProperty({ description: 'Start time in 24-hour format (HH:MM)', example: '03:00' })
  @IsString()
  startTime: string;

  @ApiProperty({ description: 'End day of the week', example: 'monday' })
  @IsString()
  endDay: string;

  @ApiProperty({ description: 'End time in 24-hour format (HH:MM)', example: '03:00' })
  @IsString()
  endTime: string;
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
    description: 'Array of user IDs to apply this rule to',
    type: [String],
    example: ['user1', 'user2', 'user3']
  })
  @IsArray()
  @IsString({ each: true })
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
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TargetDateDto)
  targetDate?: TargetDateDto[];
} 