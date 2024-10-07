import { PartialType } from '@nestjs/mapped-types';
import { CreateRecognitionTypeDto } from './create-recognition-type.dto';

export class UpdateRecognitionTypeDto extends PartialType(
  CreateRecognitionTypeDto,
) {}
