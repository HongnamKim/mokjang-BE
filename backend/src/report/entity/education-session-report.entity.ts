import { ChildEntity, Column, Index, JoinColumn, ManyToOne } from 'typeorm';
import { ReportModel } from './report.entity';
import { EducationSessionModel } from '../../management/educations/entity/education-session.entity';
import { EducationModel } from '../../management/educations/entity/education.entity';
import { EducationTermModel } from '../../management/educations/entity/education-term.entity';

@ChildEntity('EDUCATIONSESSION')
export class EducationSessionReportModel extends ReportModel {
  @Index()
  @Column()
  educationSessionId: number;

  @ManyToOne(() => EducationSessionModel, (session) => session.reports)
  @JoinColumn({ name: 'educationSessionId' })
  educationSession: EducationSessionModel;

  @Index()
  @Column()
  educationId: number;

  @ManyToOne(() => EducationModel)
  @JoinColumn({ name: 'educationId' })
  education: EducationModel;

  @Index()
  @Column()
  educationTermId: number;

  @ManyToOne(() => EducationTermModel)
  @JoinColumn({ name: 'educationTermId' })
  educationTerm: EducationTermModel;
}
