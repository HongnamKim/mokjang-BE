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
import { GenderEnum } from '../const/enum/gender.enum';
import { BaptismEnum } from '../const/enum/baptism.enum';
import { FamilyRelationModel } from '../../family-relation/entity/family-relation.entity';
import { MarriageOptions } from '../member-domain/const/marriage-options.const';
import { Exclude } from 'class-transformer';
import { BaseModel } from '../../common/entity/base.entity';
import { UserModel } from '../../user/entity/user.entity';
import { ChurchModel } from '../../churches/entity/church.entity';
import { MinistryModel } from '../../management/ministries/entity/ministry.entity';
import { OfficerModel } from '../../management/officers/entity/officer.entity';
import { EducationEnrollmentModel } from '../../management/educations/entity/education-enrollment.entity';
import { EducationTermModel } from '../../management/educations/entity/education-term.entity';
import { GroupModel } from '../../management/groups/entity/group.entity';
import { GroupRoleModel } from '../../management/groups/entity/group-role.entity';
import { RequestInfoModel } from '../../request-info/entity/request-info.entity';
import { MinistryHistoryModel } from '../../member-history/entity/ministry-history.entity';
import { OfficerHistoryModel } from '../../member-history/entity/officer-history.entity';
import { GroupHistoryModel } from '../../member-history/entity/group-history.entity';
import { VisitationDetailModel } from '../../visitation/entity/visitation-detail.entity';
import { VisitationMetaModel } from '../../visitation/entity/visitation-meta.entity';
import { TaskModel } from '../../task/entity/task.entity';
import { EducationSessionModel } from '../../management/educations/entity/education-session.entity';
import { PermissionTemplateModel } from '../../permission/entity/permission-template.entity';
import { ChurchUserModel } from '../../church-user/entity/church-user.entity';

@Entity()
export class MemberModel extends BaseModel {
  @Index()
  @Column({ nullable: true })
  userId: number;

  @OneToOne(() => UserModel, (user) => user.member)
  @JoinColumn({ name: 'userId' })
  user: UserModel;

  @OneToOne(() => ChurchUserModel, (churchUser) => churchUser.member)
  churchUser: ChurchUserModel;

  @Column({ nullable: true })
  isPermissionActive: boolean;

  @Column({ nullable: true })
  permissionTemplateId: number | null;

  @ManyToOne(() => PermissionTemplateModel, (template) => template.members)
  @JoinColumn({ name: 'permissionTemplateId' })
  permissionTemplate: PermissionTemplateModel;

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
  @OneToMany(() => FamilyRelationModel, (family) => family.me)
  family: FamilyRelationModel[];

  @OneToMany(() => FamilyRelationModel, (family) => family.familyMember)
  counterFamily: FamilyRelationModel[];

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

  @OneToMany(() => EducationTermModel, (term) => term.inCharge)
  inChargeEducationTerm: EducationTermModel[];

  @OneToMany(() => EducationSessionModel, (session) => session.inCharge)
  inChargeEducationSession: EducationSessionModel[];

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

  // --------------- 심방 -------------------

  // 진행하는 심방
  @OneToMany(
    () => VisitationMetaModel,
    (visitationMeta) => visitationMeta.inCharge,
  )
  inChargingVisitations: VisitationMetaModel[];

  // 생성한 심방
  @OneToMany(
    () => VisitationMetaModel,
    (visitationMeta) => visitationMeta.creator,
  )
  createdVisitations: VisitationMetaModel[];

  // 참여한 심방
  @ManyToMany(
    () => VisitationMetaModel,
    (visitationMeta) => visitationMeta.members,
  )
  visitationMetas: VisitationMetaModel[];

  // 나의 심방 세부 내용
  @OneToMany(
    () => VisitationDetailModel,
    (visitingDetail) => visitingDetail.member,
  )
  visitationDetails: VisitationDetailModel[];

  // --------------- 심방 -------------------

  // --------------- 업무 -------------------

  // 생성한 업무
  @OneToMany(() => TaskModel, (task) => task.creator)
  createdTask: TaskModel[];

  // 할당 받은 업무
  @OneToMany(() => TaskModel, (task) => task.inCharge)
  assignedTask: TaskModel[];

  // --------------- 업무 -------------------

  // ------------------ 보고 -------------------------
}
