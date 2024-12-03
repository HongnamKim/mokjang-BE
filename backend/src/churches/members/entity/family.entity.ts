import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { MemberModel } from './member.entity';

@Entity()
@Unique(['meId', 'familyMemberId'])
export class FamilyModel {
  @PrimaryColumn()
  @Index()
  meId: number;

  @ManyToOne(() => MemberModel, (member) => member.family)
  me: MemberModel;

  @PrimaryColumn()
  @Index()
  familyMemberId: number;

  @ManyToOne(() => MemberModel, (member) => member.counterFamily)
  familyMember: MemberModel;

  @Column({ default: '가족' })
  relation?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}