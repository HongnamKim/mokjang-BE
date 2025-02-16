import {
  BeforeRemove,
  Column,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  Unique,
} from 'typeorm';
import { BaseModel } from '../../../common/entity/base.entity';
import { GenderEnum } from '../const/enum/gender.enum';
import { ChurchModel } from '../../entity/church.entity';
import { BaptismEnum } from '../enum/baptism.enum';
import { OfficerModel } from '../../management/entity/officer/officer.entity';
import { MinistryModel } from '../../management/entity/ministry/ministry.entity';
import { FamilyModel } from './family.entity';
import { MarriageOptions } from '../const/marriage-options.const';
import { GroupHistoryModel } from '../../members-management/entity/group-history.entity';
import { EducationTermModel } from '../../management/entity/education/education-term.entity';
import { EducationEnrollmentModel } from '../../management/entity/education/education-enrollment.entity';
import { GroupModel } from '../../management/entity/group/group.entity';
import { MinistryHistoryModel } from '../../members-management/entity/ministry-history.entity';
import { GroupRoleModel } from '../../management/entity/group/group-role.entity';
import { OfficerHistoryModel } from '../../members-management/entity/officer-history.entity';
import { Exclude } from 'class-transformer';
import { InternalServerErrorException } from '@nestjs/common';

@Entity()
@Unique(['name', 'mobilePhone', 'churchId'])
export class MemberModel extends BaseModel {
  @Column()
  @Index()
  @Exclude({ toPlainOnly: true })
  churchId: number;

  @ManyToOne(() => ChurchModel, (church) => church.members)
  church: ChurchModel;

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
  group: GroupModel;

  @Index()
  @Column({ comment: '그룹 역할 ID', nullable: true })
  @Exclude({ toPlainOnly: true })
  groupRoleId: number | null;

  @ManyToOne(() => GroupRoleModel, (groupRole) => groupRole.members)
  groupRole: GroupRoleModel;

  @OneToMany(() => GroupHistoryModel, (groupHistory) => groupHistory.member)
  groupHistory: GroupHistoryModel[];

  @BeforeRemove()
  preventIfHasRelations() {
    if (this.family.length > 0) {
      // 가족 relation 확인
      throw new InternalServerErrorException('family relation exception');
    }

    if (this.guiding.length > 0) {
      // 인도자 relation 확인
      throw new InternalServerErrorException('guiding relation exception');
    }

    if (this.instructingEducation.length > 0) {
      // 진행자로 등록된 교육 relation
      throw new InternalServerErrorException(
        'instructing education relation exception',
      );
    }

    if (this.ministries.length > 0 || this.ministryHistory.length > 0) {
      // 사역과 N:N 관계, 사역 이력 1:N 관계
      throw new InternalServerErrorException(
        `ministries relation exception ${this.ministries.length} ${this.ministryHistory.length}`,
      );
    }

    if (this.officerHistory.length > 0) {
      // 직분 이력과 1:N 관계
      throw new InternalServerErrorException(
        'officer history relation exception',
      );
    }

    if (this.educations.length > 0) {
      // 교육 등록과 1 : N 관계
      throw new InternalServerErrorException('educations relation exception');
    }

    if (this.groupHistory.length > 0) {
      throw new InternalServerErrorException(
        'education history relation exception',
      );
    }
  }
}
