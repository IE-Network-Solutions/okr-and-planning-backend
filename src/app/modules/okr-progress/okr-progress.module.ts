import { Module } from '@nestjs/common';
import { OkrProgressService } from './okr-progress.service';
import { OkrProgressController } from './okr-progress.controller';

@Module({
  controllers: [OkrProgressController],
  providers: [OkrProgressService]
})
export class OkrProgressModule {}
