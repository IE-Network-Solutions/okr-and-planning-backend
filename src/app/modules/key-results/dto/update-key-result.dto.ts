import { PartialType } from '@nestjs/swagger';
import { CreateKeyResultDto } from './create-key-result.dto';

export class UpdateKeyResultDto extends PartialType(CreateKeyResultDto) {}
