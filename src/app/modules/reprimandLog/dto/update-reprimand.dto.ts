import { PartialType } from '@nestjs/mapped-types';
import { CreateReprimandDto } from './create-reprimand.dto';

export class UpdateReprimandDto extends PartialType(CreateReprimandDto) {}
