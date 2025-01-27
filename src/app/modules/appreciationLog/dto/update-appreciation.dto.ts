import { PartialType } from '@nestjs/mapped-types';
import { CreateAppreciationDto } from './create-appreciation.dto';

export class UpdateAppreciationDto extends PartialType(CreateAppreciationDto) {}
