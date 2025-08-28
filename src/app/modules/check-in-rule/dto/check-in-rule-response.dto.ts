import { AppliesTo } from '../enum/applies-to.enum';
import { Operation } from '../enum/operation.enum';
import { Action } from '../enum/action.enum';

export class CheckInRuleResponseDto {
  id: string;
  name: string;
  description?: string;
  appliesTo: AppliesTo;
  planningPeriodId: string;
  timeBased: boolean;
  achievementBased: boolean;
  frequency: number;
  operation: Operation;
  tenantId: string;
  categoryId: string;
  action: Action;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
} 