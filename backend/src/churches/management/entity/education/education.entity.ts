import { BaseModel } from '../../../../common/entity/base.entity';
import { Column, Entity, Index, ManyToOne, OneToMany } from 'typeorm';
import { EducationTermModel } from './education-term.entity';
import { ChurchModel } from '../../../entity/church.entity';

@Entity()
export class EducationModel extends BaseModel {
  @Column({ length: 50, comment: '교육명' })
  name: string;

  @Column({
    type: 'varchar',
    length: 300,
    comment: '교육 설명',
    nullable: true,
  })
  description: string | null;

  @Index()
  @Column({ comment: '교회 ID' })
  churchId: number;

  @ManyToOne(() => ChurchModel, (church) => church.educations)
  church: ChurchModel;

  @OneToMany(() => EducationTermModel, (term) => term.education)
  educationTerms: EducationTermModel[];
}
