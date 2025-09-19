import { ChildEntity, Column, Index, ManyToOne } from 'typeorm';
import { VisitationMetaModel } from '../../../visitation/entity/visitation-meta.entity';
import { ReportModel } from '../../base-report/entity/report.entity';
import { ReportType } from '../../base-report/const/report-type.enum';

@ChildEntity(ReportType.VISITATION)
export class VisitationReportModel extends ReportModel {
  @Index()
  @Column()
  visitationId: number;

  @ManyToOne(() => VisitationMetaModel, (visitation) => visitation.reports, {
    onDelete: 'CASCADE',
  })
  visitation: VisitationMetaModel;
}
