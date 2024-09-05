import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { PaginationService } from '../../../core/pagination/pagination.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly paginationService: PaginationService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const user = this.userRepository.create(createUserDto);
    return await this.userRepository.save(user);
  }

  async findAll(
    options: IPaginationOptions,
    orderBy = 'id',
    orderDirection: 'ASC' | 'DESC' = 'DESC',
  ): Promise<Pagination<User>> {
    return this.paginationService.paginate<User>(
      this.userRepository,
      'p',
      options,
      orderBy,
      orderDirection,
    );
  }

  async findOne(id: string) {
    try {
      return await this.userRepository.findOneByOrFail({ id: id });
    } catch (error) {}
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.userRepository.update({ id }, updateUserDto);
    return this.userRepository.findOneBy({ id });
  }

  async remove(id: string) {
    const doesExist = await this.userRepository.findOne({ where: { id } });
    if (!doesExist) {
      throw new Error(`User with id ${id} not found.`);
    }
    return await this.userRepository.softDelete({ id });
  }
}
