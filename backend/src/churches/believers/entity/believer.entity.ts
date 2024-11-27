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
import { EducationModel } from '../../entity/education.entity';
import { PositionModel } from '../../entity/position.entity';
import { MinistryModel } from '../../entity/ministry.entity';
import { GroupModel } from '../../entity/group.entity';

@Entity()
@Unique(['churchId', 'name', 'mobilePhone'])
export class BelieverModel extends BaseModel {
  @Column()
  @Index()
  name: string;

  @Column()
  @Index()
  mobilePhone: string;

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

  @Column({ nullable: true })
  occupation: string;

  @Column({ nullable: true })
  school: string;

  @Column({ nullable: true })
  marriage: string;

  @Column({ nullable: true, type: 'simple-array', default: null })
  vehicleNumber: string[];

  // 사역 CRUD 완성 후 N:1 relation 추가
  @Column({ nullable: true, comment: '사역 ID' })
  ministryId: number;

  @ManyToOne(() => MinistryModel, (ministry) => ministry.believers)
  ministry: MinistryModel;

  // 소그룹 CRUD 완성 후 N:1 relation 추가
  @Column({ nullable: true, comment: '소그룹 ID' })
  groupId: number;

  @ManyToOne(() => GroupModel, (group) => group.believers)
  group: GroupModel;

  @Column({ nullable: true, comment: '직분 ID' })
  positionId: number;

  @ManyToOne(() => PositionModel, (position) => position.believers)
  position: PositionModel;

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

  @ManyToMany(() => EducationModel, (education) => education.believers)
  @JoinTable()
  educations: EducationModel[];

  @ManyToOne(() => ChurchModel, (church) => church.believers)
  church: ChurchModel;

  @Column({ nullable: true })
  guidedById: number;

  // 나를 인도한 사람
  @ManyToOne(() => BelieverModel, (believer) => believer.guiding)
  guidedBy: BelieverModel;

  // 내가 인도한 사람
  @OneToMany(() => BelieverModel, (believer) => believer.guidedBy)
  guiding: BelieverModel;
}
