import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';

import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { PaginationService } from '../../../core/pagination/pagination.service';
@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private productsRepository: Repository<Product>,
    private readonly paginationService: PaginationService,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const product = this.productsRepository.create(createProductDto);
    return await this.productsRepository.save(product);
  }
  async findAll(options: IPaginationOptions): Promise<Pagination<Product>> {
    const queryBuilder = this.productsRepository
      .createQueryBuilder('product')
      .leftJoin('product.user', 'user')
      .select(['product', 'user']);

    return this.paginationService.paginate<Product>(
      queryBuilder,

      options,
    );
  }

  async findOne(id: string) {
    try {
      return await this.productsRepository.findOneByOrFail({ id: id });
    } catch (error) {}
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    await this.productsRepository.update({ id }, updateProductDto);
    return this.productsRepository.findOneBy({ id });
  }

  async remove(id: string) {
    const doesExist = await this.productsRepository.findOne({ where: { id } });
    if (!doesExist) {
      throw new Error(`Product with id ${id} not found.`);
    }
    return await this.productsRepository.softDelete({ id });
  }
}
