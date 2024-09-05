import { IsDate, IsEmail, IsString } from 'class-validator';

export class CreateClientDto {
  @IsString()
  name: string;
  @IsEmail()
  email: string;
  @IsString()
  phoneNumber: string;

  @IsString()
  contactInfo: string;

  // packageID: integer

  // databaseID: integer
  @IsDate()
  licenseDate: Date;
  @IsString()
  status: string;
}
