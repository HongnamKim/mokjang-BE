import { BaseModel } from '../../common/entity/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { RequestInfoModel } from '../request-info/entity/request-info.entity';
import { MemberModel } from '../members/entity/member.entity';
import { GroupModel } from '../settings/entity/group.entity';
import { EducationModel } from '../settings/entity/education.entity';
import { OfficerModel } from '../settings/entity/officer.entity';
import { MinistryModel } from '../settings/entity/ministry.entity';

@Entity()
export class ChurchModel extends BaseModel {
  @Column()
  name: string;

  @OneToMany(() => GroupModel, (group) => group.church)
  groups: GroupModel[];

  @OneToMany(() => EducationModel, (education) => education.church)
  educations: EducationModel[];

  @OneToMany(() => OfficerModel, (position) => position.church)
  positions: OfficerModel[];

  @OneToMany(() => MinistryModel, (ministry) => ministry.church)
  ministries: MinistryModel[];

  @Column({ default: 0 })
  dailyRequestAttempts: number;

  @Column({ default: new Date('1900-01-01'), type: 'timestamptz' })
  lastRequestDate: Date;

  @OneToMany(() => RequestInfoModel, (requestInfo) => requestInfo.church)
  requestInfos: RequestInfoModel[];

  @OneToMany(() => MemberModel, (member) => member.church)
  members: MemberModel[];
}
