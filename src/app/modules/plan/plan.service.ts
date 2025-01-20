import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePlanDto } from './dto/create-plan.dto';
import { Plan } from './entities/plan.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository, TreeRepository } from 'typeorm';
import { PaginationService } from '@root/src/core/pagination/pagination.service';
import { PlanningPeriodUser } from '../planningPeriods/planning-periods/entities/planningPeriodUser.entity';
import { PlanTask } from '../plan-tasks/entities/plan-task.entity';
import { GetFromOrganizatiAndEmployeInfoService } from '../objective/services/get-data-from-org.service';
import { ObjectiveService } from '../objective/services/objective.service';
import { IPaginationOptions } from 'nestjs-typeorm-paginate';

@Injectable()
export class PlanService {
  constructor(
    @InjectRepository(PlanTask)
    private taskRepository: TreeRepository<PlanTask>,
    @InjectRepository(Plan)
    private planRepository: TreeRepository<Plan>,
    @InjectRepository(PlanningPeriodUser)
    private planningUserRepository: Repository<PlanningPeriodUser>,
    private readonly paginationService: PaginationService,
    private readonly objectiveService: ObjectiveService,

    private readonly getFromOrganizatiAndEmployeInfoService: GetFromOrganizatiAndEmployeInfoService,
  ) {}
  async create(createPlanDto: CreatePlanDto, tenantId: string): Promise<Plan> {
    try {
      try {
        const activeSession =
          await this.getFromOrganizatiAndEmployeInfoService.getActiveSession(
            tenantId,
          );
        createPlanDto.sessionId = activeSession.id;
      } catch (error) {
        throw new NotFoundException(
          'There is no active Session for this tenant',
        );
      }
      const planningUser = await this.planningUserRepository.findOne({
        where: { id: createPlanDto.planningUserId },
      });

      if (!planningUser) {
        throw new NotFoundException('Planning user assignment not found');
      }

      let parentPlan: Plan | null = null;

      if (createPlanDto.parentPlanId) {
        parentPlan = await this.planRepository.findOne({
          where: { id: createPlanDto.parentPlanId },
        });
        if (!parentPlan) {
          throw new NotFoundException('Parent plan not found');
        }
      }

      if (!createPlanDto.parentPlanId) {
        const plan = this.planRepository.create({
          ...createPlanDto,
          tenantId: tenantId,
        });
        plan.isReported = false;
        plan.isValidated = false;
        return await this.planRepository.save(plan);
      }

      const plan = this.planRepository.create({
        userId: createPlanDto.userId,
        tenantId: tenantId,
        description: planningUser.planningPeriod.name,
        level: createPlanDto.level,
        parentPlan: parentPlan || null,
        planningUser: planningUser,
        isReported: false,
        isValidated: false,
        createdBy: createPlanDto.userId,
      });
      return await this.planRepository.save(plan);
    } catch (error) {
      if (error.name === 'EntityNotFoundError') {
        throw new NotFoundException('Error creating the plan');
      }
      throw error;
    }
  }

  async validate(
    planId: string,
    tenantId: string,
    value: string,
  ): Promise<Plan> {
    try {
      const plan = await this.planRepository.findOne({
        where: { id: planId },
      });
      let bool: boolean;
      if (value === 'true') {
        bool = true;
      } else {
        bool = false;
      }
      if (plan.isValidated === true && bool === true) {
        throw new NotFoundException('Already validated plan');
      } else if (plan.isValidated === false && bool === false) {
        throw new NotFoundException('Already open plan');
      }
      if (plan.tenantId === tenantId) {
        plan.isValidated = bool;
      }
      return await this.planRepository.save(plan);
    } catch (error) {
      if (error.name === 'EntityNotFoundError') {
        throw new NotFoundException('Error validation the plan');
      }
      throw error;
    }
  }

  async open(planId: string, tenantId: string): Promise<Plan> {
    try {
      const plan = await this.planRepository.findOne({
        where: { id: planId },
      });

      if (plan.isValidated === false) {
        throw new NotFoundException('Already opened plan');
      }

      if (plan.tenantId === tenantId) {
        plan.isValidated = false;
      }
      return await this.planRepository.save(plan);
    } catch (error) {
      if (error.name === 'EntityNotFoundError') {
        throw new NotFoundException('Error validation the plan');
      }
      throw error;
    }
  }

  findAll() {
    return `This action returns all plan`;
  }

  async findOne(id: string): Promise<Plan> {
    try {
      const plan = await this.planRepository.findOneByOrFail({ id });
      return await this.planRepository.findDescendantsTree(plan);
      // return plan
    } catch (error) {
      if (error.name === 'EntityNotFoundError') {
        throw new NotFoundException('Error fetching the specified plan');
      }
      throw error;
    }
  }
  async remove(id: string) {
    try {
      const plan = await this.planRepository.findOneByOrFail({ id });
      if (!plan) {
        throw new NotFoundException('Error while deleting the plan');
      }
      const tasks = await this.taskRepository.find({
        where: { plan: { id: plan.id } },
      });
      for (const task of tasks) {
        const id = task.id;
        await this.taskRepository.softRemove({ id });
      }
      return await this.planRepository.softRemove({ id });
    } catch (error) {
      if (error.name === 'EntityNotFoundError') {
        throw new NotFoundException(
          `The specified plan with id ${id} can not be found`,
        );
      }
      throw error;
    }
  }

  async updateByColumn(id: string, updatedValue: { columnName: string; value: any },    transactionalEntityManager?: EntityManager,
  ) : Promise<void> {
    // Use transactionalEntityManager if provided, else fallback to default repository
    const manager = transactionalEntityManager || this.planRepository.manager;

    const plan = await manager.findOne(Plan, { where: { id } });
    if (!plan) {
      throw new NotFoundException('Plan not found');
    }
    // Update the column dynamically
    plan[updatedValue.columnName] = updatedValue.value;

    await manager.save(plan);
  }
  async getAllPlansByPlanningPeriodAndUser(
    planningPeriodId: string,
    userId: string
  ): Promise<any> {
    try {

      // const getObjective=(objectiveId:string)=>{
      //      return await this.objectiveService.findOneObjective(objectiveId)
      // }
      // Step 1: Fetch the Planning User
      const planningUser = await this.planningUserRepository.findOne({
        where: { planningPeriodId, userId },
      });
  
      if (!planningUser) {
        throw new NotFoundException(
          `The specified planning period or user does not exist.`
        );
      }
  
      // Step 2: Fetch All Plans for the User
      const plans = await this.planRepository.find({
        where: { planningUserId: planningUser.id },
        relations: [
          'plan', // Child plans
          'parentPlan', // Parent plans
          'tasks', // Tasks related to the plan
          'tasks.keyResult', // KeyResult related to tasks
          'tasks.keyResult.objective', // Objective related to KeyResult
        ],
      });
  
      if (!plans || plans.length === 0) {
        return []; // Return an empty array if no plans exist
      }
  
      // Step 3: Build Hierarchical Response
      const buildHierarchy = (plan: Plan): any => {
        return {
          id: plan.id,
          name: plan.description,
          isValidated: plan.isValidated,
          isReported: plan.isReported,
          level: plan.level,
          parentPlan: plan.parentPlan
            ? buildHierarchy(plan.parentPlan)
            : null, // Recursively fetch parent plans
          tasks: plan.tasks.map((task) => task),
        };
      };
  
      // Step 4: Transform Plans into Hierarchical Structure
      return plans.map(buildHierarchy);
    } catch (error) {
      throw error;
    }
  }

  async findPlansByUsersAndPlanningPeriodId(    
      planningPeriodId: string,
      arrayOfUserId: string[],
      options: IPaginationOptions,
      tenantId:string
    ):Promise<any>{
      try {
        const page = Number(options.page) || 1;
        const limit = Number(options.limit) || 10;

        const allPlanningUser=await this.planningUserRepository.find({where:{planningPeriodId,tenantId}});
        const usersPlanData = await this.planRepository.find({
          where: { userId: In(arrayOfUserId), tenantId },
          relations: [
            'tasks', // Load tasks related to the plan
            'tasks.planTask', // Load descendants of the tasks
            'tasks.parentTask', // Load the parent task relationship
            'planningUser', // Load the planning period assignment
            'planningUser.planningPeriod', // Load the planning period definition
            'tasks.keyResult', // Load the key result belonging to the parent task
            'tasks.keyResult.objective', // Load the objective related to the key result
            'tasks.keyResult.metricType', // Load the metricType for the key result
            'tasks.milestone', // Load milestones related to tasks
            'comments', // Load comments related to the plan
          ],
        });
        

       if(usersPlanData && usersPlanData?.length>0){
        const filteredData=usersPlanData?.filter((planData:any)=>{
          const planningUserId=allPlanningUser?.find((planningUser:any)=>planningUser.userId===planData?.userId);
          const filterByPlanningUser=planData.planningUserId===planningUserId;
          return filterByPlanningUser
        })
        return filteredData;
       }
      }

      catch(error){
        throw Error('internal server error')
      }
}
}
  
