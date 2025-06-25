import { IsOptional, IsString } from 'class-validator';

export class UpdateFailureReasonDto {
  id?: string;
  name: string;
  description: string;
  tenantId: string;
  @IsOptional()
  @IsString()
  createdBy?: string;
  @IsOptional()
  @IsString()
  updatedBy?: string;
}
