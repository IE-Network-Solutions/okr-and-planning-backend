import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { PaginationService } from '../../../core/pagination/pagination.service';
import { User } from '../users/entities/user.entity';
import { ProductsController } from './products.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Product, User])],
  controllers: [ProductsController],
  providers: [ProductsService, PaginationService],
})
export class ProductsModule {}
