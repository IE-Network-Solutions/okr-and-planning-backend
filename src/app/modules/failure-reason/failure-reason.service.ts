import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FailureReason } from './entities/failure-reason.entity';
import { UpdateFailureReasonDto } from './dto/update-failure-reason.dto';
import { CreateFailureReasonDto } from './dto/create-failure-reason.dto';

@Injectable()
export class FailureReasonService {
  constructor(
    @InjectRepository(FailureReason)
    private readonly failureReasonRepo: Repository<FailureReason>,
  ) {}

  // Create a new failure reason
  async createFailureReason(
    createFailureReasonDto: CreateFailureReasonDto,
    tenantId: string,
  ): Promise<FailureReason> {
    const failureReason = this.failureReasonRepo.create({
      ...createFailureReasonDto,
      tenantId,
    });
    return this.failureReasonRepo.save(failureReason);
  }
  async getAllFailureReasons(tenantId: string): Promise<any[]> {
    return this.failureReasonRepo.find({
      where: { tenantId: tenantId }, // Filter by tenantId
    });
  }

  async deleteFailureReason(
    failureReasonId: string,
    tenantId: string,
  ): Promise<any> {
    return this.failureReasonRepo.delete(failureReasonId);
  }
  async updateFailureReason(
    failureReasonId: string,
    updateFailureReasonDto: UpdateFailureReasonDto,
    tenantId: string,
  ): Promise<void> {
    const failureReason = await this.failureReasonRepo.findOne({
      where: { id: failureReasonId, tenantId: tenantId }, // Ensure tenantId matches
    });

    if (!failureReason) {
      throw new NotFoundException(
        `The failure reason you're looking for could not be found.`,
      );
    }

    // Update the failure reason fields with new data
    Object.assign(failureReason, updateFailureReasonDto);

    await this.failureReasonRepo.save(failureReason); // Save the updated entity
  }
}
