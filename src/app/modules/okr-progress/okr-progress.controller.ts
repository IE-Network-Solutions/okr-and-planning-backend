import { Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { OkrProgressService } from './okr-progress.service';

@Controller('okr-progress')
@ApiTags('okr-progress')
export class OkrProgressController {
  constructor(private readonly okrProgressService: OkrProgressService) {}

  @Post()
  async createObjective() {
 
   return null
  }
}
