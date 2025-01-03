import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { BaseModel } from '../../../common/entity/base.entity';
import { EducationModel } from '../../settings/entity/education.entity';
import { MemberModel } from '../../members/entity/member.entity';
import { EducationStatus } from '../const/education-status.enum';

@Entity()
export class EducationHistoryModel extends BaseModel {
  @Index()
  @Column()
  educationId: number;

  @Column()
  educationName: string;

  @ManyToOne(() => EducationModel, (education) => education.history)
  education: EducationModel;

  @Index()
  @Column()
  memberId: number;

  @ManyToOne(() => MemberModel, (member) => member.educationHistory)
  member: MemberModel;

  @Column({ enum: EducationStatus })
  status: EducationStatus;

  @Column()
  startDate: Date;

  @Column({ nullable: true })
  endDate: Date;
}
