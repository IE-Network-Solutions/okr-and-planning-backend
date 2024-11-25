import { BaseModel } from "@root/src/database/base.model";
import { Column, Entity, ManyToOne } from "typeorm";
import { VpScoring } from "./vp-scoring.entity";

@Entity()
export class VpScoreInstance extends BaseModel {
 
    @Column({ type: 'uuid' })
    userId: string;
  
    @Column({ type: 'uuid' })
    vpScoringId: string;
  
    @ManyToOne(() => VpScoring, { onDelete: 'CASCADE' })
    vpScoring: VpScoring;
  
    @Column({ type: 'decimal', precision: 10, scale: 2 })
    vpScore: number;
  
    @Column({ type: 'json' })
    breakdown: Record<string, any>;///what type
  
    @Column({ type: 'uuid' })
    monthId: string;
  
    @Column({ type: 'uuid' })
    tenantId: string;
}
