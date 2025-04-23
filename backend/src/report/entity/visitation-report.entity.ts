import { ChildEntity, Column, Index, ManyToOne } from 'typeorm';
import { VisitationMetaModel } from '../../visitation/entity/visitation-meta.entity';
import { ReportModel } from './report.entity';

@ChildEntity('VISITATION')
export class VisitationReportModel extends ReportModel {
  @Index()
  @Column()
  visitationId: number;

  @ManyToOne(() => VisitationMetaModel, (visitation) => visitation.reports)
  visitation: VisitationMetaModel;
}
