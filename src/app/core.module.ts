import { Global, Module } from '@nestjs/common';

import { PermissionModule } from './modules/permission/permission.module';
import { ProductsModule } from './modules/products/products.module';
import { UsersModule } from './modules/users/users.module';
import { ClientsModule } from './modules/clients/clients.module';
@Global()
@Module({
  imports: [
    PermissionModule,
    ProductsModule,
    UsersModule,
    ClientsModule,
  ],
})
export class CoreModule { }
