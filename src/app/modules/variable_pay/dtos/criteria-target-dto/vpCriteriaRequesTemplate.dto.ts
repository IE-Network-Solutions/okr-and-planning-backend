import { IsOptional, IsString } from 'class-validator';

export class RequestTemplateDto {
  @IsOptional()
  @IsString()
  key?: string;
}
