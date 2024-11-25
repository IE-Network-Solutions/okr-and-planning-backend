import { BaseModel } from "@root/src/database/base.model";
import { Column, Entity, OneToMany } from "typeorm";
import { VpScoringCriterion } from "./vp-scoring-criterion.entity";
import { VpScoreInstance } from "./vp-score-instance.entity";
import { UserVpScoring } from "./user-vp-scoring.entity";

@Entity()
export class VpScoring extends BaseModel {
  
    @Column({ type: 'varchar', length: 255 })
    name: string;
  
    @Column({ type: 'int' })
    totalPercentage: number;
  
    @Column({ type: 'uuid' })
    tenantId: string;
    @OneToMany(() => VpScoringCriterion,(score)=>score.vpScoring )
    vpScoringCriterions: VpScoringCriterion[];
    @OneToMany(() => VpScoreInstance,(score)=>score.vpScoring )
    vpScoreInstance: VpScoreInstance[];
    @OneToMany(() => UserVpScoring,(score)=>score.vpScoring )
    userVpScoring: UserVpScoring[];
}
