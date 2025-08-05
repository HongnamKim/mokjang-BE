import { ChildEntity, Column, Index, JoinColumn, ManyToOne } from 'typeorm';
import { ReportModel } from './report.entity';
import { EducationSessionModel } from '../../educations/education-session/entity/education-session.entity';
import { EducationModel } from '../../educations/education/entity/education.entity';
import { EducationTermModel } from '../../educations/education-term/entity/education-term.entity';
import { ReportType } from '../const/report-type.enum';

@ChildEntity(ReportType.EDUCATION_SESSION)
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
