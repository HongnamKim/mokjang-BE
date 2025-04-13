import { ChildEntity, Column, ManyToOne } from 'typeorm';
import { VisitationMetaModel } from '../../visitation/entity/visitation-meta.entity';
import { ReportModel } from './report.entity';

@ChildEntity('VISITATION')
export class VisitationReportModel extends ReportModel {
  @Column()
  visitationId: number;

  @ManyToOne(() => VisitationMetaModel)
  visitation: VisitationMetaModel;
}
