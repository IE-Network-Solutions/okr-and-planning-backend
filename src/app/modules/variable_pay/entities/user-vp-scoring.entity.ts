import { BaseModel } from "@root/src/database/base.model";
import { Column, Entity, ManyToOne } from "typeorm";
import { VpScoring } from "./vp-scoring.entity";

@Entity()
export class UserVpScoring extends BaseModel {  
  
    @Column({ type: 'uuid' })
    userId: string;
  
    @Column({ type: 'uuid' })
    vpScoringId: string;
  
    @ManyToOne(() => VpScoring, { onDelete: 'CASCADE' })
    vpScoring: VpScoring;
  
    @Column({ type: 'uuid' })
    tenantId: string;
}
