import { Column, Entity, ManyToOne } from "typeorm";
import { VpScoring } from "./vp-scoring.entity";
import { VpCriteria } from "./vp-criteria.entity";
import { BaseModel } from "@root/src/database/base.model";

@Entity()
export class VpScoringCriterion extends BaseModel {

    @Column({ type: 'uuid' })
    vpScoringId: string;
  
    @ManyToOne(() => VpScoring, { onDelete: 'CASCADE' })
    vpScoring: VpScoring;
  
    @Column({ type: 'uuid' })
    vpCriteriaId: string;
  
    @ManyToOne(() => VpCriteria, { onDelete: 'CASCADE' })
    vpCriteria: VpCriteria;
  
    @Column({ type: 'decimal', precision: 10, scale: 2 })
    weight: number;
  
    @Column({ type: 'uuid' })
    tenantId: string;
}
