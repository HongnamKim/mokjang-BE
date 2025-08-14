import { ChildEntity, Column, Index, JoinColumn, ManyToOne } from 'typeorm';
import { ReportType } from '../../base-report/const/report-type.enum';
import { ReportModel } from '../../base-report/entity/report.entity';
import { EducationTermModel } from '../../../educations/education-term/entity/education-term.entity';
import { EducationModel } from '../../../educations/education/entity/education.entity';

/*@ChildEntity(ReportType.EDUCATION_TERM)
export class EducationTermReportModel extends ReportModel {
  @Index()
  @Column()
  educationTermId: number;

  @ManyToOne(() => EducationTermModel, (term) => term.reports)
  @JoinColumn({ name: 'educationTermId' })
  educationTerm: EducationTermModel;

  @Index()
  @Column()
  educationId: number;

  @ManyToOne(() => EducationModel)
  @JoinColumn({ name: 'educationId' })
  education: EducationModel;
}*/
