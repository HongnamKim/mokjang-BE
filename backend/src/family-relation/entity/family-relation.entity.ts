import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { MemberModel } from '../../members/entity/member.entity';
import { BaseModel } from '../../common/entity/base.entity';

@Entity()
export class FamilyRelationModel extends BaseModel {
  @Index()
  @Column()
  meId: number;

  @ManyToOne(() => MemberModel, (member) => member.family)
  @JoinColumn({ name: 'meId' })
  me: MemberModel;

  @Index()
  @Column()
  familyMemberId: number;

  @ManyToOne(() => MemberModel, (member) => member.counterFamily)
  @JoinColumn({ name: 'familyMemberId' })
  familyMember: MemberModel;

  @Column({ default: '가족 관계' })
  relation: string;
}
