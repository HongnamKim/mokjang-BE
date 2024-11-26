import { BaseModel } from '../../common/entity/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { RequestInfoModel } from '../request-info/entity/request-info.entity';
import { BelieverModel } from '../believers/entity/believer.entity';

@Entity()
export class ChurchModel extends BaseModel {
  @Column()
  name: string;

  @Column({ default: 0 })
  dailyRequestAttempts: number;

  @Column({ nullable: true })
  lastRequestDate: Date;

  @OneToMany(
    () => RequestInfoModel,
    (requestInfo) => requestInfo.requestedChurch,
  )
  requestInfos: RequestInfoModel[];

  @OneToMany(() => BelieverModel, (believer) => believer.church)
  believers: BelieverModel[];
}
