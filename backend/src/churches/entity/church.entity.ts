import { BaseModel } from '../../common/entity/base.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  Unique,
} from 'typeorm';
import { UserModel } from '../../user/entity/user.entity';
import { MemberSize } from '../const/member-size.enum';
import { GroupModel } from '../../management/groups/entity/group.entity';
import { EducationModel } from '../../management/educations/entity/education.entity';
import { OfficerModel } from '../../management/officers/entity/officer.entity';
import { MinistryGroupModel } from '../../management/ministries/entity/ministry-group.entity';
import { MinistryModel } from '../../management/ministries/entity/ministry.entity';
import { MemberModel } from '../../members/entity/member.entity';
import { RequestInfoModel } from '../../request-info/entity/request-info.entity';
import { VisitationMetaModel } from '../../visitation/entity/visitation-meta.entity';
import { ChurchJoinModel } from '../../church-join/entity/church-join.entity';
import { Exclude } from 'class-transformer';
import { TaskModel } from '../../task/entity/task.entity';
import { ChurchUserModel } from '../../church-user/entity/church-user.entity';
import { WorshipModel } from '../../worship/entity/worship.entity';

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

  @Column({ default: 0 })
  memberCount: number;

  @Column({ nullable: true })
  ownerUserId: number;

  @OneToOne(() => UserModel, (user) => user.ownedChurch)
  @JoinColumn({ name: 'ownerUserId' })
  ownerUser: UserModel;

  @OneToMany(() => ChurchUserModel, (churchUser) => churchUser.church)
  churchUsers: ChurchUserModel[];

  @Column({ default: 0 })
  groupCount: number;

  @OneToMany(() => GroupModel, (group) => group.church)
  groups: GroupModel[];

  @Column({ default: 0 })
  educationCount: number;

  @OneToMany(() => EducationModel, (education) => education.church)
  educations: EducationModel[];

  @Column({ default: 0 })
  officerCount: number;

  @OneToMany(() => OfficerModel, (officer) => officer.church)
  officers: OfficerModel[];

  @Column({ default: 0 })
  ministryGroupCount: number;

  @OneToMany(() => MinistryGroupModel, (ministryGroup) => ministryGroup.church)
  ministryGroups: MinistryGroupModel[];

  @Column({ default: 0 })
  ministryCount: number;

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

  // 교인
  @OneToMany(() => MemberModel, (member) => member.church)
  members: MemberModel[];

  // 계정 가입
  @OneToMany(() => ChurchJoinModel, (joinRequest) => joinRequest.church)
  joinRequests: ChurchJoinModel[];

  // 심방
  @OneToMany(() => VisitationMetaModel, (visitingMeta) => visitingMeta.church)
  visitations: VisitationMetaModel[];

  @Column({ default: 0 })
  visitationCount: number;

  // 업무
  @OneToMany(() => TaskModel, (task) => task.church)
  tasks: TaskModel[];

  @Column({ default: 0 })
  taskCount: number;

  @OneToMany(() => WorshipModel, (worship) => worship.church)
  worships: WorshipModel[];

  @Column({ default: 0 })
  worshipCount: number;
}

export enum ManagementCountType {
  GROUP = 'groupCount',
  MINISTRY_GROUP = 'ministryGroupCount',
  MINISTRY = 'ministryCount',
  OFFICER = 'officerCount',
  EDUCATION = 'educationCount',
  VISITATION = 'visitationCount',
  TASK = 'taskCount',
  WORSHIP = 'worshipCount',
}
