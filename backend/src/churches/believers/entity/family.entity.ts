import { BaseModel } from '../../../common/entity/base.entity';
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
import { BelieverModel } from './believer.entity';

@Entity()
@Unique(['meId', 'familyMemberId'])
export class FamilyModel {
  @PrimaryColumn()
  @Index()
  meId: number;

  @ManyToOne(() => BelieverModel, (believer) => believer.family)
  me: BelieverModel;

  @PrimaryColumn()
  @Index()
  familyMemberId: number;

  @ManyToOne(() => BelieverModel, (believer) => believer.counterFamily)
  familyMember: BelieverModel;

  @Column({ default: '가족' })
  relation?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
