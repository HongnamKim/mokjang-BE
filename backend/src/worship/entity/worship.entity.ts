import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BaseModel } from '../../common/entity/base.entity';
import { ChurchModel } from '../../churches/entity/church.entity';
import { WorshipTargetGroupModel } from './worship-target-group.entity';
import { WorshipEnrollmentModel } from './worship-enrollment.entity';

@Entity()
export class WorshipModel extends BaseModel {
  @Index()
  @Column()
  churchId: number;

  @ManyToOne(() => ChurchModel)
  @JoinColumn({ name: 'churchId' })
  church: ChurchModel;

  @Column()
  title: string;

  @Column({ default: '' })
  description: string;

  @Column({ comment: 'indexOfDay 사용' })
  worshipDay: number;

  @Column({ comment: '반복 주기' })
  repeatPeriod: number;

  @OneToMany(
    () => WorshipTargetGroupModel,
    (worshipTargetGroup) => worshipTargetGroup.worship,
  )
  worshipTargetGroups: WorshipTargetGroupModel[];

  @OneToMany(
    () => WorshipEnrollmentModel,
    (worshipEnrollment) => worshipEnrollment.worship,
  )
  worshipEnrollments: WorshipEnrollmentModel[];
}
