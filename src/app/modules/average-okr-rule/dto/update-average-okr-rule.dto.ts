import { PartialType } from '@nestjs/swagger';
import { CreateAverageOkrRuleDto } from './create-average-okr-rule.dto';

export class UpdateAverageOkrRuleDto extends PartialType(
  CreateAverageOkrRuleDto,
) {}
