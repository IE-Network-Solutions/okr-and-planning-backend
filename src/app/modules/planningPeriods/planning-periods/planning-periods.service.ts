import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { PlanningPeriod } from './entities/planningPeriod.entity';
import { PlanningPeriodUser } from './entities/planningPeriodUser.entity';
import { DataSource, In, Repository } from 'typeorm';
import { CreatePlanningPeriodsDTO } from './dto/create-planningPeriods.dto';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { PaginationDto } from '@root/src/core/commonDto/pagination-dto';
import { PaginationService } from '../../../../core/pagination/pagination.service';
import { AssignUsersDTO } from './dto/assignUser.dto';
import { PlannnigPeriodUserDto } from './dto/planningPeriodUser.dto';
import { FilterUserDto } from './dto/filter-user.dto';

@Injectable()
export class PlanningPeriodsService {
  constructor(
    @InjectRepository(PlanningPeriod)
    private planningPeriodRepository: Repository<PlanningPeriod>,
    @InjectRepository(PlanningPeriodUser)
    private planningUserRepository: Repository<PlanningPeriodUser>,
    private readonly paginationService: PaginationService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}
  async createPlanningPeriods(
    createPlanningPeriodsDto: CreatePlanningPeriodsDTO,
    tenantId: string,
  ): Promise<PlanningPeriod> {
    try {
      const period = await this.planningPeriodRepository.create({
        ...createPlanningPeriodsDto,
        tenantId: tenantId,
      });
      return await this.planningPeriodRepository.save(period);
    } catch (error) {
      if (error.name === 'EntityNotFoundError') {
        throw new NotFoundException('Error creating the planning period');
      }
      throw error;
    }
  }
  async findAllPlanningPeriods(
    paginationOptions: PaginationDto,
    tenantId: string,
  ): Promise<Pagination<PlanningPeriod>> {
    try {
      const options: IPaginationOptions = {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      };
      const paginatedData =
        await this.paginationService.paginate<PlanningPeriod>(
          this.planningPeriodRepository,
          'p',
          options,
          paginationOptions.orderBy,
          paginationOptions.orderDirection,
          { tenantId },
        );
      if (!paginatedData) {
        throw new NotFoundException('No planning period entries found');
      }
      return paginatedData;
    } catch (error) {
      if (error.name === 'EntityNotFoundError') {
        throw new NotFoundException('No Planning period found');
      }
    }
  }
  async findOnePlanningPeriod(id: string): Promise<PlanningPeriod> {
    try {
      const planning = await this.planningPeriodRepository.findOneByOrFail({
        id,
      });
      return planning;
    } catch (error) {
      if (error.name === 'EntityNotFoundError') {
        throw new NotFoundException(
          'The requested planning period does not exist',
        );
      }
      throw error;
    }
  }
  async updatePlanningPeriod(
    id: string,
    createPlanningPeriodsDto: CreatePlanningPeriodsDTO,
  ): Promise<PlanningPeriod> {
    try {
      const planning = await this.findOnePlanningPeriod(id);
      if (!planning) {
        throw new NotFoundException(
          `Planning period that you are updating with Id ${id} does not exist`,
        );
      }
      const updatedPlanning = await this.planningPeriodRepository.update(
        id,
        createPlanningPeriodsDto,
      );
      if (!updatedPlanning) {
        throw new NotFoundException(
          'Error while updating the selected planning period',
        );
      }
      return await this.findOnePlanningPeriod(id);
    } catch (error) {
      if (error.name === 'EntityNotFoundError') {
        throw new NotFoundException(
          'The update attempt can not find the specified period',
        );
      }
      throw error;
    }
  }
  async removePlanningPeriod(id: string): Promise<PlanningPeriod> {
    try {
      const planning = await this.findOnePlanningPeriod(id);
      if (!planning) {
        throw new NotFoundException(
          'Error while deleting the selected planning period',
        );
      }
      return await this.planningPeriodRepository.softRemove({ id });
    } catch (error) {
      throw new NotFoundException(
        `The specified planning period with id ${id} can not be found`,
      );
    }
  }
  async removePlanningPeriodUsersByUserId(
    userId: string,
  ): Promise<PlanningPeriodUser[]> {
    try {
      // Retrieve all planning users associated with the given userId
      const planningUsers = await this.planningUserRepository.find({
        where: { userId },
      });

      // Check if any planning users were found
      if (planningUsers.length === 0) {
        throw new NotFoundException(
          `No planning period users found for userId ${userId}`,
        );
      }

      // Loop through each planning user and perform soft removal
      const removedUsers: PlanningPeriodUser[] = [];
      for (const user of planningUsers) {
        const removedUser = await this.planningUserRepository.softRemove(user);
        removedUsers.push(removedUser);
      }

      return removedUsers; // Return the list of removed users
    } catch (error) {
      // Handle EntityNotFoundError if the planning user does not exist
      if (error instanceof NotFoundException) {
        throw error; // Re-throw the NotFoundException for proper handling
      }
      throw new Error(
        `An error occurred while deleting planning period users: ${error.message}`,
      );
    }
  }
  async updatePlanningPeriodStatus(id: string): Promise<PlanningPeriod> {
    try {
      const planningperiod =
        await this.planningPeriodRepository.findOneByOrFail({ id });

      await this.planningPeriodRepository.update(planningperiod.id, {
        isActive: !planningperiod.isActive,
      });

      const updatedPlanningPeriod =
        await this.planningPeriodRepository.findOneBy({ id });

      if (!updatedPlanningPeriod) {
        throw new NotFoundException(
          `The Planning period that you are updating for user with Id ${id} does not exist`,
        );
      }

      return updatedPlanningPeriod;
    } catch (error) {
      if (error.name === 'EntityNotFoundError') {
        throw new NotFoundException('Error assigning user');
      }
      throw error;
    }
  }
  async updateMultiplePlanningPeriodUser(
    userId: string,
    values: PlannnigPeriodUserDto,
    tenantId: string,
  ): Promise<PlanningPeriodUser[]> {
    return await this.dataSource.transaction(async (manager) => {
      try {
        const existingUsers = await manager.find(PlanningPeriodUser, {
          where: { userId },
        });

        if (existingUsers.length > 0) {
          await manager.softRemove(existingUsers); // Soft remove if using soft deletes
        }
        const newPlanningPeriodUsers = values.planningPeriods.map(
          (planningPeriodId) =>
            manager.create(PlanningPeriodUser, {
              userId,
              planningPeriodId,
              tenantId,
            }),
        );
        const savedUsers = await manager.save(
          PlanningPeriodUser,
          newPlanningPeriodUsers,
        );
        return savedUsers;
      } catch (error) {
        throw new Error(
          `Error updating PlanningPeriodUsers for user with ID ${userId}: ${error.message}`,
        );
      }
    });
  }

  async assignUser(
    assignUserDto: AssignUsersDTO,
    tenantId: string,
  ): Promise<PlanningPeriodUser> {
    try {
      const planningPeriod = await this.planningPeriodRepository.findOne({
        where: { id: assignUserDto.planningPeriodId },
      });
      const assign = this.planningUserRepository.create({
        ...assignUserDto,
        tenantId: tenantId,
        planningPeriod: planningPeriod,
      });
      return await this.planningUserRepository.save(assign);
    } catch (error) {
      if (error.name === 'EntityNotFoundError') {
        throw new NotFoundException('Error assigning user');
      }
      throw error;
    }
  }
  async assignMultiplePlanningPeriodForMultipleUsers(
    assignUserDto: PlannnigPeriodUserDto,
    tenantId: string,
  ): Promise<PlanningPeriodUser[]> {
    try {
      // Fetch planning periods by IDs
      const planningPeriods = await this.planningPeriodRepository.findByIds(
        assignUserDto.planningPeriods,
      );
      // console.log(planningPeriods,"planningPeriods")

      if (!planningPeriods.length) {
        throw new NotFoundException(
          'No planning periods found for the provided IDs.',
        );
      }

      const assignedUsers: PlanningPeriodUser[] = [];
      const newAssignments = [];

      for (const userId of assignUserDto.userIds) {
        for (const planningPeriodId of planningPeriods) {
          const existingAssignation = await this.planningUserRepository.find({
            where: {
              userId: userId,
              planningPeriodId: planningPeriodId?.id,
            },
          });

          if (existingAssignation?.length > 0) {
            continue; // Skip if already assigned
          }

          // Prepare the new assignment
          newAssignments.push(
            this.planningUserRepository.create({
              planningPeriodId: planningPeriodId?.id,
              userId: userId,
              tenantId: tenantId,
            }),
          );
        }
      }

      // console.log(newAssignments,"newAssignments")
      // Save all new assignments in bulk
      const savedUsers = await this.planningUserRepository.save(newAssignments);
      assignedUsers.push(...savedUsers);

      return assignedUsers;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(
        `An error occurred while assigning users: ${error.message}`,
      );
    }
  }

  async findAll(
    tenantId: string,
    paginationOptions: PaginationDto,
    filterUSerDto: FilterUserDto,
  ): Promise<Pagination<PlanningPeriodUser>> {
    try {
      const options: IPaginationOptions = {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      };

      const queryBuilder = await this.planningUserRepository
        .createQueryBuilder('PlanningPeriod')

        .andWhere('PlanningPeriod.tenantId = :tenantId', { tenantId });

      if (filterUSerDto?.userId) {
        queryBuilder.andWhere('PlanningPeriod.userId = :userId', {
          userId: filterUSerDto.userId,
        });
      }
      const paginatedData =
        await this.paginationService.paginate<PlanningPeriodUser>(
          queryBuilder,
          options,
        );
      return paginatedData;
    } catch (error) {
      if (error.name === 'EntityNotFoundError') {
        throw new NotFoundException('No assigned users found');
      }
    }
  }
  async findByUser(id: string): Promise<PlanningPeriodUser[]> {
    try {
      const planningPeriodUser = await this.planningUserRepository.find({
        where: {
          userId: id,
        },
      });
      return planningPeriodUser;
    } catch (error) {
      if (error.name === 'EntityNotFoundError') {
        throw new NotFoundException(
          'The requested user`s planning period does not exist',
        );
      }
      throw error;
    }
  }
  async findByPeriod(
    paginationOptions: PaginationDto,
    id: string,
  ): Promise<Pagination<PlanningPeriodUser>> {
    try {
      const options: IPaginationOptions = {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      };
      const planningPeriod = await this.planningPeriodRepository.findOne({
        where: { id: id },
      });
      const planningPeriodUser =
        await this.paginationService.paginate<PlanningPeriodUser>(
          this.planningUserRepository,
          'p',
          options,
          paginationOptions.orderBy,
          paginationOptions.orderDirection,
          { planningPeriod: planningPeriod },
        );
      return planningPeriodUser;
    } catch (error) {
      if (error.name === 'EntityNotFoundError') {
        throw new NotFoundException(
          'The requested planning period does not exist in assignment',
        );
      }
      throw error;
    }
  }
  async updatePlanningPeriodUser(
    id: string,
    assignUserDto: AssignUsersDTO,
  ): Promise<PlanningPeriodUser[]> {
    try {
      const planningUser = await this.planningUserRepository.findOneByOrFail({
        id,
      });

      const existingAssignment = await this.planningUserRepository.findOne({
        where: {
          userId: planningUser.userId,
          planningPeriodId: assignUserDto.planningPeriodId, // Assuming AssignUsersDTO contains planningPeriodId
        },
      });

      if (existingAssignment) {
        throw new ConflictException(
          `The planningPeriodId ${assignUserDto.planningPeriodId} is already assigned to user ${planningUser.userId}`,
        );
      }
      await this.planningUserRepository.update(planningUser.id, assignUserDto);
      return await this.findByUser(planningUser.userId);
    } catch (error) {
      if (error.name === 'EntityNotFoundError') {
        throw new NotFoundException(`Planning user with ID ${id} not found.`);
      }
      if (error instanceof ConflictException) {
        throw error; // Re-throw ConflictException
      }
      throw new InternalServerErrorException(
        `An error occurred while updating the planning user: ${error.message}`,
      );
    }
  }

  async findOnePlanningPeriodByName(
    planningPeriodTitle: string,
    tenantId: string,
  ) {
    try {
      const planningPeriod = await this.planningPeriodRepository.findOneOrFail({
        where: {
          name: planningPeriodTitle.toLowerCase(),
          tenantId: tenantId,
        },
      });
      return planningPeriod;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
