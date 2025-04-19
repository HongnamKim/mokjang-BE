import { BaseModel } from '../../common/entity/base.entity';
import { Column, Entity, OneToMany, Unique } from 'typeorm';
import { UserModel } from '../../user/entity/user.entity';
import { MemberSize } from '../const/member-size.enum';
import { GroupModel } from '../../management/groups/entity/group.entity';
import { GroupRoleModel } from '../../management/groups/entity/group-role.entity';
import { EducationModel } from '../../management/educations/entity/education.entity';
import { OfficerModel } from '../../management/officers/entity/officer.entity';
import { MinistryGroupModel } from '../../management/ministries/entity/ministry-group.entity';
import { MinistryModel } from '../../management/ministries/entity/ministry.entity';
import { MemberModel } from '../../members/entity/member.entity';
import { RequestInfoModel } from '../../request-info/entity/request-info.entity';
import { VisitationMetaModel } from '../../visitation/entity/visitation-meta.entity';
import { ChurchJoinRequestModel } from './church-join-request.entity';
import { Exclude } from 'class-transformer';

@Entity()
@Unique(['joinCode'])
export class ChurchModel extends BaseModel {
  @Column()
  name: string;

  @Column({ nullable: true })
  identifyNumber: string;

  @Column({ nullable: true, length: 20 })
  joinCode: string;

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

  @OneToMany(() => UserModel, (user) => user.church)
  users: UserModel[];

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
  @Exclude()
  dailyRequestAttempts: number;

  @Column({ default: new Date('1900-01-01'), type: 'timestamptz' })
  @Exclude()
  lastRequestDate: Date;

  @OneToMany(() => RequestInfoModel, (requestInfo) => requestInfo.church)
  requestInfos: RequestInfoModel[];

  @OneToMany(() => MemberModel, (member) => member.church)
  members: MemberModel[];

  @OneToMany(() => ChurchJoinRequestModel, (joinRequest) => joinRequest.church)
  joinRequests: ChurchJoinRequestModel[];

  @OneToMany(() => VisitationMetaModel, (visitingMeta) => visitingMeta.church)
  visitations: VisitationMetaModel[];
}
