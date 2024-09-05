import { Injectable } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Permission } from './entities/permission.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}
  async create(permission: CreatePermissionDto): Promise<Permission> {
    const product = this.permissionRepository.create(permission);
    return await this.permissionRepository.save(product);
  }

  async findAll(): Promise<Permission[]> {
    return await this.permissionRepository.find();
  }

  async findOne(id: string): Promise<Permission> {
    return await this.permissionRepository.findOneByOrFail({ id });
  }
  async update(
    id: string,
    updatePermissionDto: UpdatePermissionDto,
  ): Promise<Permission> {
    const doesExist = await this.permissionRepository.findOne({
      where: { id },
    });
    if (!doesExist) {
      throw new Error(`Permission with id ${id} not found.`);
    }
    await this.permissionRepository.update({ id }, updatePermissionDto);
    return this.permissionRepository.findOneBy({ id });
  }
  async remove(id: string): Promise<any> {
    const doesExist = await this.permissionRepository.findOne({
      where: { id },
    });
    if (!doesExist) {
      throw new Error(`Permission with id ${id} not found.`);
    }
    return await this.permissionRepository.softDelete({ id });
  }
}
