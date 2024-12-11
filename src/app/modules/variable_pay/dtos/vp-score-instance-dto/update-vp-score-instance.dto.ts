import { PartialType } from '@nestjs/mapped-types';
import { CreateVpScoreInstanceDto } from './create-vp-score-instance.dto';

export class UpdateVpScoreInstanceDto extends PartialType(
  CreateVpScoreInstanceDto,
) {}
