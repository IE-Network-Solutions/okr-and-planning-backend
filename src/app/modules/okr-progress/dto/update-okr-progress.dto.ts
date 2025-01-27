import { PartialType } from '@nestjs/mapped-types';
import { CreateOkrProgressDto } from './create-okr-progress.dto';

export class UpdateOkrProgressDto extends PartialType(CreateOkrProgressDto) {}
