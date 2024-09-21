import { PartialType } from '@nestjs/swagger';
import { CreateKeyResultDto } from './create-key-result.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateKeyResultDto extends PartialType(CreateKeyResultDto) {
    @IsOptional()
    @IsString()
    id?: string
}
