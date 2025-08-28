import { PartialType } from '@nestjs/mapped-types';
import { CreateCheckInRuleDto } from './create-check-in-rule.dto';

export class UpdateCheckInRuleDto extends PartialType(CreateCheckInRuleDto) {} 