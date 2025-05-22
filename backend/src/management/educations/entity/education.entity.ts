import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { EducationTermModel } from './education-term.entity';
import { BaseModel } from '../../../common/entity/base.entity';
import { ChurchModel } from '../../../churches/entity/church.entity';
import { MemberModel } from '../../../members/entity/member.entity';

@Entity()
export class EducationModel extends BaseModel {
  @Column({ length: 50, comment: '교육명' })
  name: string;

  @Column({ default: '', comment: '교육 설명' })
  description: string;

  @Index()
  @Column({ comment: '교회 ID' })
  churchId: number;

  @ManyToOne(() => ChurchModel, (church) => church.educations)
  church: ChurchModel;

  @Column()
  creatorId: number;

  @ManyToOne(() => MemberModel)
  @JoinColumn({ name: 'creatorId' })
  creator: MemberModel;

  @OneToMany(() => EducationTermModel, (term) => term.education)
  educationTerms: EducationTermModel[];
}
