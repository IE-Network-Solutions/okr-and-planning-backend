import { PartialType } from '@nestjs/mapped-types';
import { CreateCarbonCopyLogDto } from './create-carbon-copy-log.dto';

export class UpdateCarbonCopyLogDto extends PartialType(
  CreateCarbonCopyLogDto,
) {}
