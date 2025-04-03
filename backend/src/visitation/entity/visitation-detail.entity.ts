import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseModel } from '../../common/entity/base.entity';
import { VisitationMetaModel } from './visitation-meta.entity';
import { MemberModel } from '../../members/entity/member.entity';

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

  @Index()
  @Column()
  memberId: number;

  @ManyToOne(() => MemberModel, (member) => member.visitationDetails)
  @JoinColumn({ name: 'memberId' })
  member: MemberModel;

  @Column()
  visitationContent: string;

  @Column()
  visitationPray: string;
}
