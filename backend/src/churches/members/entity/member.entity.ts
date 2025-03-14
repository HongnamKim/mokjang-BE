import {
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { BaseModel } from '../../../common/entity/base.entity';
import { GenderEnum } from '../const/enum/gender.enum';
import { ChurchModel } from '../../entity/church.entity';
import { BaptismEnum } from '../enum/baptism.enum';
import { FamilyModel } from './family.entity';
import { MarriageOptions } from '../const/marriage-options.const';
import { GroupHistoryModel } from '../../members-management/entity/group-history.entity';
import { MinistryHistoryModel } from '../../members-management/entity/ministry-history.entity';
import { OfficerHistoryModel } from '../../members-management/entity/officer-history.entity';
import { Exclude } from 'class-transformer';
import { RequestInfoModel } from '../../request-info/entity/request-info.entity';
import { UserModel } from '../../../user/entity/user.entity';
import { MinistryModel } from '../../../management/entity/ministry/ministry.entity';
import { OfficerModel } from '../../../management/entity/officer/officer.entity';
import { EducationEnrollmentModel } from '../../../management/entity/education/education-enrollment.entity';
import { EducationTermModel } from '../../../management/entity/education/education-term.entity';
import { GroupModel } from '../../../management/group/entity/group.entity';
import { GroupRoleModel } from '../../../management/group/entity/group-role.entity';

@Entity()
//@Unique(['name', 'mobilePhone', 'churchId'])
export class MemberModel extends BaseModel {
  @Index()
  @Column({ nullable: true })
  userId: number;

  @OneToOne(() => UserModel, (user) => user.member)
  @JoinColumn({ name: 'userId' })
  user: UserModel;

  @Column()
  @Index()
  @Exclude({ toPlainOnly: true })
  churchId: number;

  @ManyToOne(() => ChurchModel, (church) => church.members)
  @JoinColumn({ name: 'churchId' })
  church: ChurchModel;

  @OneToOne(() => RequestInfoModel, (requestInfo) => requestInfo.member)
  requestInfo: RequestInfoModel;

  @Index()
  @Column({ default: new Date() })
  registeredAt: Date;

  @Column({ length: 30, comment: '교인 이름' })
  @Index()
  name: string;

  @Column({ length: 15, comment: '휴대폰 전화 번호' })
  @Index()
  mobilePhone: string;

  @Column({ default: false, comment: '생일 음력 여부' })
  isLunar: boolean;

  @Index()
  @Column({ nullable: true, comment: '생년 월일' })
  birth: Date;

  @Index()
  @Column({ enum: GenderEnum, nullable: true, comment: '성별' })
  gender: GenderEnum;

  @Column({ length: 50, nullable: true, comment: '도로명 주소' })
  address: string;

  @Column({ length: 50, nullable: true, comment: '상세 주소' })
  detailAddress: string;

  @Index()
  @Column({ length: 15, nullable: true, comment: '집 전화 번호' })
  homePhone: string;

  // 가족 관계
  @OneToMany(() => FamilyModel, (family) => family.me)
  family: FamilyModel[];

  @OneToMany(() => FamilyModel, (family) => family.familyMember)
  counterFamily: FamilyModel[];

  @Index()
  @Column({ length: 30, nullable: true, comment: '직업' })
  occupation: string;

  @Index()
  @Column({ length: 30, nullable: true, comment: '학교' })
  school: string;

  @Index()
  @Column({ enum: MarriageOptions, nullable: true, comment: '결혼 정보' })
  marriage: MarriageOptions;

  @Column({ nullable: true, comment: '세부 결혼 정보' })
  marriageDetail: string;

  @Index()
  @Column('text', { array: true, default: [], comment: '차량 번호 4자리' })
  vehicleNumber: string[];

  @Column({ nullable: true })
  @Exclude({ toPlainOnly: true })
  guidedById: number | null;

  // 나를 인도한 사람
  @ManyToOne(() => MemberModel, (member) => member.guiding)
  @JoinColumn({ name: 'guidedById' })
  guidedBy: MemberModel;

  // 내가 인도한 사람
  @OneToMany(() => MemberModel, (member) => member.guidedBy)
  guiding: MemberModel[];

  @Column({ length: 30, nullable: true, comment: '이전교회 이름' })
  previousChurch: string;

  @Index()
  @Column({
    enum: BaptismEnum,
    default: BaptismEnum.default,
    comment: '신급',
  })
  baptism: BaptismEnum;

  @ManyToMany(() => MinistryModel, (ministry) => ministry.members)
  @JoinTable()
  ministries: MinistryModel[];

  @OneToMany(
    () => MinistryHistoryModel,
    (ministryHistory) => ministryHistory.member,
  )
  ministryHistory: MinistryHistoryModel[];

  @Index()
  @Column({ nullable: true, comment: '현재 직분 ID' })
  @Exclude({ toPlainOnly: true })
  officerId: number | null;

  @ManyToOne(() => OfficerModel, (officer) => officer.members)
  @JoinColumn({ name: 'officerId' })
  officer: OfficerModel;

  @Column({ type: 'timestamptz', nullable: true, comment: '임직일' })
  officerStartDate: Date | null;

  @Column({ type: 'varchar', nullable: true, comment: '임직교회' })
  officerStartChurch: string | null;

  @OneToMany(
    () => OfficerHistoryModel,
    (officerHistory) => officerHistory.member,
  )
  officerHistory: OfficerHistoryModel[];

  @OneToMany(
    () => EducationEnrollmentModel,
    (educationEnrollment) => educationEnrollment.member,
  )
  educations: EducationEnrollmentModel[];

  @OneToMany(() => EducationTermModel, (term) => term.instructor)
  instructingEducation: EducationTermModel[];

  @Index()
  @Column({ comment: '그룹 ID', nullable: true })
  @Exclude({ toPlainOnly: true })
  groupId: number | null;

  @ManyToOne(() => GroupModel, (group) => group.members)
  @JoinColumn({ name: 'groupId' })
  group: GroupModel;

  @Index()
  @Column({ comment: '그룹 역할 ID', nullable: true })
  @Exclude({ toPlainOnly: true })
  groupRoleId: number | null;

  @ManyToOne(() => GroupRoleModel, (groupRole) => groupRole.members)
  @JoinColumn({ name: 'groupRoleId' })
  groupRole: GroupRoleModel;

  @OneToMany(() => GroupHistoryModel, (groupHistory) => groupHistory.member)
  groupHistory: GroupHistoryModel[];
}
