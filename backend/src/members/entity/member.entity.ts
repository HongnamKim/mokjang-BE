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
import { Gender } from '../const/enum/gender.enum';
import { Baptism } from '../const/enum/baptism.enum';
import { FamilyRelationModel } from '../../family-relation/entity/family-relation.entity';
import { Marriage } from '../const/enum/marriage.enum';
import { Exclude } from 'class-transformer';
import { BaseModel } from '../../common/entity/base.entity';
import { ChurchModel } from '../../churches/entity/church.entity';
import { MinistryModel } from '../../management/ministries/entity/ministry.entity';
import { OfficerModel } from '../../management/officers/entity/officer.entity';
import { GroupModel } from '../../management/groups/entity/group.entity';
import { RequestInfoModel } from '../../request-info/entity/request-info.entity';
import { MinistryHistoryModel } from '../../member-history/ministry-history/entity/child/ministry-history.entity';
import { OfficerHistoryModel } from '../../member-history/officer-history/entity/officer-history.entity';
import { GroupHistoryModel } from '../../member-history/group-history/entity/group-history.entity';
import { VisitationMetaModel } from '../../visitation/entity/visitation-meta.entity';
import { TaskModel } from '../../task/entity/task.entity';
import { ChurchUserModel } from '../../church-user/entity/church-user.entity';
import { GroupRole } from '../../management/groups/const/group-role.enum';
import { MinistryGroupModel } from '../../management/ministries/entity/ministry-group.entity';
import { MinistryGroupHistoryModel } from '../../member-history/ministry-history/entity/ministry-group-history.entity';
import { EducationEnrollmentModel } from '../../educations/education-enrollment/entity/education-enrollment.entity';
import { EducationTermModel } from '../../educations/education-term/entity/education-term.entity';
import { EducationSessionModel } from '../../educations/education-session/entity/education-session.entity';

@Entity()
export class MemberModel extends BaseModel {
  @OneToOne(() => ChurchUserModel, (churchUser) => churchUser.member)
  churchUser: ChurchUserModel;

  @Column()
  @Index()
  @Exclude({ toPlainOnly: true })
  churchId: number;

  @ManyToOne(() => ChurchModel, (church) => church.members, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'churchId' })
  church: ChurchModel;

  @OneToOne(() => RequestInfoModel, (requestInfo) => requestInfo.member)
  requestInfo: RequestInfoModel;

  @Index()
  @Column({ default: new Date() })
  registeredAt: Date;

  @Column({ default: '' })
  profileImageUrl: string;

  @Column({ length: 30, comment: '교인 이름' })
  @Index()
  name: string;

  @Column({ length: 15, comment: '휴대폰 전화 번호' })
  @Index()
  mobilePhone: string;

  @Column({ default: false, comment: '생일 음력 여부' })
  isLunar: boolean;

  @Column({ default: false, comment: '윤달 여부' })
  isLeafMonth: boolean;

  @Index()
  @Column({ nullable: true, comment: '생년 월일' })
  birth: Date;

  @Index()
  @Column({ type: 'varchar', length: 5, nullable: true })
  birthdayMMDD: string;

  @Index()
  @Column({ enum: Gender, nullable: true, comment: '성별' })
  gender: Gender;

  @Index()
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
  @Column({ enum: Marriage, nullable: true, comment: '결혼 정보' })
  marriage: Marriage;

  @Column({ nullable: true, comment: '세부 결혼 정보' })
  marriageDetail: string;

  @Index()
  @Column('text', { array: true, default: [], comment: '차량 번호 4자리' })
  vehicleNumber: string[];

  @Column({ nullable: true })
  @Exclude({ toPlainOnly: true })
  guidedById: number | null;

  // 나를 인도한 사람
  @ManyToOne(() => MemberModel, (member) => member.guiding, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'guidedById' })
  guidedBy: MemberModel;

  // 내가 인도한 사람
  @OneToMany(() => MemberModel, (member) => member.guidedBy)
  guiding: MemberModel[];

  @Index()
  @Column({
    default: Baptism.NONE,
    comment: '신급',
  })
  baptism: Baptism;

  @ManyToMany(
    () => MinistryGroupModel,
    (ministryGroup) => ministryGroup.members,
  )
  @JoinTable()
  ministryGroups: MinistryGroupModel[];

  @Column({ default: GroupRole.NONE })
  ministryGroupRole: GroupRole;

  @ManyToMany(() => MinistryModel, (ministry) => ministry.members)
  @JoinTable()
  ministries: MinistryModel[];

  @OneToMany(
    () => MinistryGroupHistoryModel,
    (ministryGroupHistoryModel) => ministryGroupHistoryModel.member,
  )
  ministryGroupHistory: MinistryGroupHistoryModel[];

  @OneToMany(
    () => MinistryHistoryModel,
    (ministryHistory) => ministryHistory.member,
  )
  ministryHistory: MinistryHistoryModel[];

  @Index()
  @Column({ nullable: true, comment: '현재 직분 ID' })
  @Exclude({ toPlainOnly: true })
  officerId: number | null;

  @ManyToOne(() => OfficerModel, (officer) => officer.members, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'officerId' })
  officer: OfficerModel;

  @OneToMany(
    () => OfficerHistoryModel,
    (officerHistory) => officerHistory.member,
  )
  officerHistory: OfficerHistoryModel[];

  @OneToMany(
    () => EducationEnrollmentModel,
    (educationEnrollment) => educationEnrollment.member,
  )
  educationEnrollments: EducationEnrollmentModel[];

  @OneToMany(() => EducationTermModel, (term) => term.inCharge)
  inChargeEducationTerm: EducationTermModel[];

  @OneToMany(() => EducationSessionModel, (session) => session.inCharge)
  inChargeEducationSession: EducationSessionModel[];

  @Index()
  @Column({ comment: '그룹 ID', nullable: true })
  @Exclude({ toPlainOnly: true })
  groupId: number | null;

  @ManyToOne(() => GroupModel, (group) => group.members, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'groupId' })
  group: GroupModel;

  @Column({ default: GroupRole.NONE })
  groupRole: GroupRole;

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
    { onDelete: 'CASCADE' },
  )
  visitationMetas: VisitationMetaModel[];

  // 나의 심방 세부 내용
  /*@OneToMany(
    () => VisitationDetailModel,
    (visitingDetail) => visitingDetail.member,
  )
  visitationDetails: VisitationDetailModel[];*/

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
