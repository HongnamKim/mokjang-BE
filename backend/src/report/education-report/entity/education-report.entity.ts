import { ChildEntity, Column, Index, JoinColumn, ManyToOne } from 'typeorm';
import { ReportModel } from '../../base-report/entity/report.entity';
import { EducationSessionModel } from '../../../educations/education-session/entity/education-session.entity';
import { EducationModel } from '../../../educations/education/entity/education.entity';
import { EducationTermModel } from '../../../educations/education-term/entity/education-term.entity';
import { ReportType } from '../../base-report/const/report-type.enum';
import { EducationReportType } from '../const/education-report-type.enum';

@Index(['educationReportType', 'educationTermId'])
@Index(['educationReportType', 'educationSessionId'])
@ChildEntity(ReportType.EDUCATION)
export class EducationReportModel extends ReportModel {
  @Index()
  @Column()
  educationReportType: EducationReportType;

  @Index()
  @Column()
  educationId: number;

  @ManyToOne(() => EducationModel, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'educationId' })
  education: EducationModel;

  @Index()
  @Column()
  educationTermId: number;

  @ManyToOne(
    () => EducationTermModel,
    (educationTerm) => educationTerm.reports,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'educationTermId' })
  educationTerm: EducationTermModel;

  @Index()
  @Column({ nullable: true })
  educationSessionId?: number;

  @ManyToOne(() => EducationSessionModel, (session) => session.reports, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'educationSessionId' })
  educationSession?: EducationSessionModel;
}
