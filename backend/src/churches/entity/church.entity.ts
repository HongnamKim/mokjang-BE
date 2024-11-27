import { BaseModel } from '../../common/entity/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { RequestInfoModel } from '../request-info/entity/request-info.entity';
import { BelieverModel } from '../believers/entity/believer.entity';
import { GroupModel } from './group.entity';
import { EducationModel } from './education.entity';
import { PositionModel } from './position.entity';
import { MinistryModel } from './ministry.entity';

@Entity()
export class ChurchModel extends BaseModel {
  @Column()
  name: string;

  @OneToMany(() => GroupModel, (group) => group.church)
  groups: GroupModel[];

  @OneToMany(() => EducationModel, (education) => education.church)
  educations: EducationModel[];

  @OneToMany(() => PositionModel, (position) => position.church)
  positions: PositionModel[];

  @OneToMany(() => MinistryModel, (ministry) => ministry.church)
  ministries: MinistryModel[];

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
