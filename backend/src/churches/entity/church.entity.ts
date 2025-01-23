import { BaseModel } from '../../common/entity/base.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  OneToOne,
  Unique,
} from 'typeorm';
import { RequestInfoModel } from '../request-info/entity/request-info.entity';
import { MemberModel } from '../members/entity/member.entity';
import { GroupModel } from '../management/entity/group/group.entity';
import { OfficerModel } from '../management/entity/officer/officer.entity';
import { MinistryModel } from '../management/entity/ministry/ministry.entity';
import { UserModel } from '../../auth/entity/user.entity';
import { MemberSize } from '../const/member-size.enum';
import { GroupRoleModel } from '../management/entity/group/group-role.entity';
import { EducationModel } from '../management/entity/education/education.entity';
import { MinistryGroupModel } from '../management/entity/ministry/ministry-group.entity';

@Entity()
@Unique(['name', 'identifyNumber'])
export class ChurchModel extends BaseModel {
  @Column()
  name: string;

  @Column({ nullable: true })
  identifyNumber: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  denomination: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  detailAddress: string;

  @Column({ enum: MemberSize, nullable: true })
  memberSize: MemberSize;

  @Index()
  @Column({ nullable: true })
  mainAdminId: number;

  @JoinColumn()
  @OneToOne(() => UserModel, (user) => user.adminChurch)
  mainAdmin: UserModel;

  @OneToMany(() => UserModel, (user) => user.managingChurch)
  subAdmins: UserModel[];

  @OneToMany(() => GroupModel, (group) => group.church)
  groups: GroupModel[];

  @OneToMany(() => GroupRoleModel, (groupRole) => groupRole.church)
  groupRoles: GroupRoleModel[];

  @OneToMany(() => EducationModel, (education) => education.church)
  educations: EducationModel[];

  @OneToMany(() => OfficerModel, (officer) => officer.church)
  officers: OfficerModel[];

  @OneToMany(() => MinistryGroupModel, (ministryGroup) => ministryGroup.church)
  ministryGroups: MinistryGroupModel[];

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
