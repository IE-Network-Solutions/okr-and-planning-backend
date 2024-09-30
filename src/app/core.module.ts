import { Global, Module } from '@nestjs/common';

import { PermissionModule } from './modules/permission/permission.module';
import { ProductsModule } from './modules/products/products.module';
import { UsersModule } from './modules/users/users.module';
import { ClientsModule } from './modules/clients/clients.module';
import { ReportCommentsModule } from './modules/report-comments/report-comments.module';
import { OkrReportModule } from './modules/okr-report/okr-report.module';
import { OkrReportTaskModule } from './modules/okr-report-task/okr-report-task.module';
import { FailureReasonModule } from './modules/failure-reason/failure-reason.module';
@Global()
@Module({
  imports: [
    PermissionModule,
    ProductsModule,
    UsersModule,
    ClientsModule,
    // ReportCommentsModule,
    OkrReportModule,
    // OkrReportTaskModule,
    FailureReasonModule,
  ],
})
export class CoreModule { }
