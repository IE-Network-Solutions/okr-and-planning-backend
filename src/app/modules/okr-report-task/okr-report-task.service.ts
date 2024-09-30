import { ConflictException, Injectable } from '@nestjs/common';
import { ReportTask } from './entities/okr-report-task.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ReportTaskDTO } from './dto/create-okr-report-task.dto';
import { Repository } from 'typeorm';

@Injectable()
export class OkrReportTaskService {

    constructor(
        @InjectRepository(ReportTask)
        private ReportTask: Repository<ReportTask>,
      ) {}
    
      async create(
        reportTaskDTO: ReportTaskDTO,
        tenantId: string,
      ) {
        const employeeType = this.ReportTask.create({
          ...reportTaskDTO,
          tenantId,
        });
        try {
          return await this.ReportTask.save(employeeType);
        } catch (error) {
          throw new ConflictException(error.message);
        }
      }
}
