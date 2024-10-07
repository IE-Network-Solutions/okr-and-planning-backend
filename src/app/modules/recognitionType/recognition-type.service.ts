import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRecognitionTypeDto } from './dto/create-recognition-type.dto';
import { UpdateRecognitionTypeDto } from './dto/update-recognition-type.dto';
import { RecognitionType } from './entities/recognition-type.entity';
import { PaginationService } from '@root/src/core/pagination/pagination.service';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { FilterRecognitionTypeDto } from './dto/filter.recognition-type.dto';
import { RecognitionTypeEnum } from './enums/recognitionType.enum';

@Injectable()
export class RecognitionTypeService {
  constructor(
    @InjectRepository(RecognitionType)
    private readonly recognitionTypeRepository: Repository<RecognitionType>,
    private readonly paginationService: PaginationService,
  ) {}

  async create(
    createRecognitionTypeDto: CreateRecognitionTypeDto,
    tenantId: string,
  ): Promise<RecognitionType> {
    const recognitionType = this.recognitionTypeRepository.create({
      ...createRecognitionTypeDto,
      tenantId,
    });
    return this.recognitionTypeRepository.save(recognitionType);
  }
  async findAll(
    options: IPaginationOptions,
    orderBy = 'createdAt',
    orderDirection: 'ASC' | 'DESC' = 'DESC',
    tenantId: string,
    filterDto: FilterRecognitionTypeDto,
  ): Promise<Pagination<RecognitionType>> {
    const { type } = filterDto;

    const queryBuilder = this.recognitionTypeRepository
      .createQueryBuilder('recognitionType')
      .andWhere('recognitionType.tenantId = :tenantId', { tenantId })
      .orderBy(`recognitionType.${orderBy}`, orderDirection);

    if (type) {
      const upperCaseType =
        type.toUpperCase() as keyof typeof RecognitionTypeEnum;

      if (upperCaseType in RecognitionTypeEnum) {
        queryBuilder.andWhere('recognitionType.type = :type', {
          type: RecognitionTypeEnum[upperCaseType],
        });
      } else {
        throw new Error(`Invalid recognition type: ${type}`);
      }
    }
    const paginatedData =
      await this.paginationService.paginate<RecognitionType>(
        queryBuilder,
        options,
      );

    return paginatedData;
  }

  async findOne(id: string): Promise<RecognitionType> {
    const recognitionType = await this.recognitionTypeRepository.findOne({
      where: { id },
    });
    if (!recognitionType) {
      throw new NotFoundException(`RecognitionType with ID ${id} not found`);
    }
    return recognitionType;
  }

  async update(
    id: string,
    updateRecognitionTypeDto: UpdateRecognitionTypeDto,
  ): Promise<RecognitionType> {
    const recognitionType = await this.findOne(id);
    if (!recognitionType) {
      throw new NotFoundException(`Recognition Type with ID ${id} not found`);
    }
    await this.recognitionTypeRepository.update(id, updateRecognitionTypeDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const recognitionType = await this.findOne(id);
    await this.recognitionTypeRepository.softRemove(recognitionType);
  }
}
