import {
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
import { GenderEnum } from '../../enum/gender.enum';
import { ChurchModel } from '../../entity/church.entity';
import { BaptismEnum } from '../enum/baptism.enum';
import { EducationModel } from '../../settings/entity/education.entity';
import { OfficerModel } from '../../settings/entity/officer.entity';
import { MinistryModel } from '../../settings/entity/ministry.entity';
import { GroupModel } from '../../settings/entity/group.entity';
import { FamilyModel } from './family.entity';

@Entity()
@Unique(['churchId', 'name', 'mobilePhone'])
export class MemberModel extends BaseModel {
  @Column()
  @Index()
  name: string;

  @Column()
  @Index()
  mobilePhone: string;

  @Column({ default: false })
  isLunar: boolean;

  @Column({ nullable: true })
  birth: Date;

  @Column({ enum: GenderEnum, nullable: true })
  gender: GenderEnum;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  detailAddress: string;

  @Column({ nullable: true })
  homePhone: string;

  // 가족 관계
  @OneToMany(() => FamilyModel, (family) => family.me)
  family: FamilyModel[];

  @OneToMany(() => FamilyModel, (family) => family.familyMember)
  counterFamily: FamilyModel[];

  @Column({ nullable: true })
  occupation: string;

  @Column({ nullable: true })
  school: string;

  @Column({ nullable: true })
  marriage: string;

  @Column({ nullable: true, type: 'simple-array', default: null })
  vehicleNumber: string[];

  @ManyToMany(() => MinistryModel, (ministry) => ministry.members)
  @JoinTable()
  ministries: MinistryModel[];

  // 소그룹 CRUD 완성 후 N:1 relation 추가
  @Column({ nullable: true, comment: '소그룹 ID' })
  groupId: number;

  @ManyToOne(() => GroupModel, (group) => group.members)
  group: GroupModel;

  @Column({ nullable: true, comment: '직분 ID' })
  officerId: number;

  @ManyToOne(() => OfficerModel, (officer) => officer.members)
  officer: OfficerModel;

  @Column({ nullable: true, comment: '임직일' })
  positionStartDate: Date;

  @Column({ nullable: true, comment: '임직교회' })
  positionStartChurch: string;

  @Column({ enum: BaptismEnum, nullable: true, comment: '신급' })
  baptism: BaptismEnum;

  @Column({ nullable: true, comment: '이전교회 이름' })
  previousChurch: string;

  @Column()
  churchId: number;

  @ManyToMany(() => EducationModel, (education) => education.members)
  @JoinTable()
  educations: EducationModel[];

  @ManyToOne(() => ChurchModel, (church) => church.members)
  church: ChurchModel;

  @Column({ nullable: true })
  guidedById: number;

  // 나를 인도한 사람
  @ManyToOne(() => MemberModel, (member) => member.guiding)
  guidedBy: MemberModel;

  // 내가 인도한 사람
  @OneToMany(() => MemberModel, (member) => member.guidedBy)
  guiding: MemberModel;
}
