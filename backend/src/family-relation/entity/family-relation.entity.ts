import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MemberModel } from '../../members/entity/member.entity';

@Entity()
export class FamilyRelationModel {
  @PrimaryColumn()
  @Index()
  meId: number;

  @ManyToOne(() => MemberModel, (member) => member.family)
  @JoinColumn({ name: 'meId' })
  me: MemberModel;

  @PrimaryColumn()
  @Index()
  familyMemberId: number;

  @ManyToOne(() => MemberModel, (member) => member.counterFamily)
  @JoinColumn({ name: 'familyMemberId' })
  familyMember: MemberModel;

  @Column({ default: '가족 관계' })
  relation: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
