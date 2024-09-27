import { Module } from '@nestjs/common';
import { OkrProgressService } from './okr-progress.service';


@Module({

  providers: [OkrProgressService],
  exports: [OkrProgressService]
})
export class OkrProgressModule { }
