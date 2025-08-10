import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseModel } from '../../common/entity/base.entity';
import { VisitationMetaModel } from './visitation-meta.entity';

@Entity()
export class VisitationDetailModel extends BaseModel {
  @Index()
  @Column()
  visitationMetaId: number;

  @ManyToOne(
    () => VisitationMetaModel,
    (visitingMeta) => visitingMeta.visitationDetails,
  )
  @JoinColumn({ name: 'visitationMetaId' })
  visitationMeta: VisitationMetaModel;

  /*@Index()
  @Column()
  memberId: number;

  @ManyToOne(() => MemberModel, (member) => member.visitationDetails)
  @JoinColumn({ name: 'memberId' })
  member: MemberModel;*/

  @Column({ default: '' })
  visitationContent: string;

  @Column({ default: '' })
  visitationPray: string;
}
