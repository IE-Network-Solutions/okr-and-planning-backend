import { IsNumber } from 'class-validator';

export class OkrProgressDto {
    @IsNumber()
    okr: number;

    okrCompleted: number;
    @IsNumber()
    daysLeft: number;


}
