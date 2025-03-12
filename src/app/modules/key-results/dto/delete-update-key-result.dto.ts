import { PartialType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {IsUUID, ValidateNested } from "class-validator";

import { UpdateKeyResultDto } from "./update-key-result.dto";

export class DeleteAndUpdateKeyResultDto  {

  @ValidateNested({ each: true })
  @Type(() => UpdateKeyResultDto)
  toBeUpdated: UpdateKeyResultDto[];


@IsUUID()
  toBeDeleted: string;
 
}