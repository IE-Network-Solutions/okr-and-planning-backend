import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
} from 'class-validator';
import { RecognitionTypeEnum } from '../enums/recognitionType.enum';

export class CreateRecognitionTypeDto {
  @IsNotEmpty({ message: 'The name field should not be empty' })
  @IsString()
  @Length(2, 50, { message: 'Name must be between 2 and 50 characters' })
  name: string;

  @IsNotEmpty({ message: 'The description field should not be empty' })
  @IsString()
  @Length(5, 255, {
    message: 'Description must be between 5 and 255 characters',
  })
  description: string;

  @IsNotEmpty({ message: 'Weight is required' })
  @IsNumber()
  weight: number;

  @IsNotEmpty({ message: 'Type is required' })
  @IsEnum(RecognitionTypeEnum, { message: 'Type must be a valid enum value' })
  type: RecognitionTypeEnum;
}
