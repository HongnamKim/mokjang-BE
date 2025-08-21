import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseModel } from '../../common/entity/base.entity';
import { WorshipEnrollmentModel } from './worship-enrollment.entity';
import { WorshipSessionModel } from './worship-session.entity';
import { AttendanceStatus } from '../const/attendance-status.enum';

@Entity()
export class WorshipAttendanceModel extends BaseModel {
  @Index()
  @Column()
  worshipSessionId: number;

  @ManyToOne(() => WorshipSessionModel, (session) => session.worshipAttendances)
  @JoinColumn({ name: 'worshipSessionId' })
  worshipSession: WorshipSessionModel;

  @Column({ default: AttendanceStatus.UNKNOWN })
  attendanceStatus: AttendanceStatus;

  @Column({ default: '' })
  note: string;

  @Index()
  @Column({ type: 'timestamptz' })
  sessionDate: Date;

  @Index()
  @Column()
  worshipEnrollmentId: number;

  @ManyToOne(
    () => WorshipEnrollmentModel,
    (enrollment) => enrollment.worshipAttendances,
  )
  @JoinColumn({ name: 'worshipEnrollmentId' })
  worshipEnrollment: WorshipEnrollmentModel;
}
