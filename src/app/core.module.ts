import { Global, Module } from '@nestjs/common';
import { PermissionModule } from './modules/permission/permission.module';
import { ProductsModule } from './modules/products/products.module';
import { UsersModule } from './modules/users/users.module';
import { ClientsModule } from './modules/clients/clients.module';
import { ReprimandLogModule } from './modules/reprimandLog/reprimand-log.module';
import { AppreciationModule } from './modules/appreciationLog/appreciation.module';
import { CarbonCopyLog } from './modules/carbonCopyLlog/entities/carbon-copy-log.entity';
import { RecognitionTypeModule } from './modules/recognitionType/recognition-type.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
@Global()
@Module({
  imports: [
    PermissionModule,
    ProductsModule,
    UsersModule,
    ClientsModule,
    RecognitionTypeModule,
    ReprimandLogModule,
    AppreciationModule,
    CarbonCopyLog,
    DashboardModule,
  ],
})
export class CoreModule {}
