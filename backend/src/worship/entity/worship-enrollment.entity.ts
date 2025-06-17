import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BaseModel } from '../../common/entity/base.entity';
import { WorshipModel } from './worship.entity';
import { MemberModel } from '../../members/entity/member.entity';
import { WorshipAttendanceModel } from './worship-attendance.entity';

@Entity()
export class WorshipEnrollmentModel extends BaseModel {
  @Index()
  @Column()
  worshipId: number;

  @ManyToOne(() => WorshipModel)
  @JoinColumn({ name: 'worshipId' })
  worship: WorshipModel;

  @Index()
  @Column()
  memberId: number;

  @ManyToOne(() => MemberModel)
  @JoinColumn({ name: 'memberId' })
  member: MemberModel;

  @Column({ default: 0 })
  presentCount: number;

  @Column({ default: 0 })
  absentCount: number;

  @OneToMany(
    () => WorshipAttendanceModel,
    (attendance) => attendance.worshipEnrollment,
  )
  worshipAttendances: WorshipAttendanceModel[];
}
