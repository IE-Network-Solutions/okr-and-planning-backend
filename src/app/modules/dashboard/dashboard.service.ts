import { Injectable } from '@nestjs/common';
import { ReprimandLogService } from '../reprimandLog/setrvices/reprimand-log.service';
import { AppreciationService } from '../appreciationLog/appreciation-log.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly appreciationLogService: AppreciationService,
    private readonly repremandService: ReprimandLogService,
  ) {}

  async findAllDashbaordData(userId: string, tenantId: string) {
    const totalNumberOfAppreciationsIssued =
      await this.appreciationLogService.countNumberOfAppreciationWithIssuedId(
        userId,
        tenantId,
      );
    const employeesAffectedByAppreciation =
      await this.appreciationLogService.countAffectedEmployeesForIssuerId(
        userId,
        tenantId,
      );
    const totalAppreciationsReceived =
      await this.appreciationLogService.countNumberOfAppreciationGivenWithRecipentId(
        userId,
        tenantId,
      );
    const employeesContributedAppreciation =
      await this.appreciationLogService.countAffectedEmployeesForRecipentId(
        userId,
        tenantId,
      );
    const totalNumberOfReprimandIssued =
      await this.repremandService.countNumberOfRepremandWithIssuedId(
        userId,
        tenantId,
      );
    const employeesAffectedByReprimand =
      await this.repremandService.countAffectedEmployeesForIssuerId(
        userId,
        tenantId,
      );
    const totalReprimandReceived =
      await this.repremandService.countNumberOfRepremandWithRecipentId(
        userId,
        tenantId,
      );
    const employeesContributedReprimand =
      await this.repremandService.countAffectedEmployeesForRecipentId(
        userId,
        tenantId,
      );

    return {
      totalNumberOfAppreciationsIssued,
      employeesAffectedByAppreciation,
      totalAppreciationsReceived,
      employeesContributedAppreciation,
      totalNumberOfReprimandIssued,
      employeesAffectedByReprimand,
      totalReprimandReceived,
      employeesContributedReprimand,
    };
  }
}
