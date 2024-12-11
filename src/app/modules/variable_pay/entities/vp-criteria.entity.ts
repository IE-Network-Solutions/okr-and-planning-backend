import { BaseModel } from '@root/src/database/base.model';
import { Column, Entity, OneToMany } from 'typeorm';
import { SourceService } from '../enums/sourceService.enum';
import { CriteriaTarget } from './criteria-target.entity';
import { VpScoringCriterion } from './vp-scoring-criterion.entity';
import { RequestTemplateDto } from '../dtos/criteria-target-dto/vpCriteriaRequesTemplate.dto';

@Entity()
export class VpCriteria extends BaseModel {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: SourceService })
  sourceService: SourceService;

  @Column({ type: 'varchar', length: 500 })
  sourceEndpoint: string;

  @Column({ type: 'boolean', default: false })
  isDeduction: boolean;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @OneToMany(() => CriteriaTarget, (target) => target.vpCriteria)
  criteriaTargets: CriteriaTarget[];
  @OneToMany(() => VpScoringCriterion, (score) => score.vpCriteria)
  vpScoringCriterions: VpScoringCriterion[];
}
