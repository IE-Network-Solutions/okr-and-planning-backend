import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsArray,
  IsOptional,
} from 'class-validator';

export class CreateAppreciationDto {
  @IsString()
  @IsNotEmpty()
  action: string;

  @IsUUID()
  @IsNotEmpty()
  typeId: string;

  @IsUUID()
  @IsNotEmpty()
  issuerId: string;

  @IsUUID()
  @IsOptional()
  recipientId?: string;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsNotEmpty()
  recipientIds: string[];

  @IsArray()
  @IsUUID('4', { each: true })
  cc: string[];
}
