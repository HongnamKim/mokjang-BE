import { MemberModel } from '../../members/entity/member.entity';
import { Entity, ManyToMany, ManyToOne, OneToMany } from 'typeorm';
import { ChurchModel } from '../../entity/church.entity';
import { BaseChurchSettingModel } from './base-church-setting.entity';
import { EducationHistoryModel } from '../../members-settings/entity/education-history.entity';

@Entity()
export class EducationModel extends BaseChurchSettingModel {
  /*
  @Index()
  @Column()
  churchId: number;

  @Column()
  name: string;

  @Column({ default: 0 })
  membersCount: number;
   */

  @ManyToOne(() => ChurchModel, (church) => church.educations)
  church: ChurchModel;

  @ManyToMany(() => MemberModel, (member) => member.educations)
  members: MemberModel[];

  @OneToMany(() => EducationHistoryModel, (history) => history.education)
  history: EducationHistoryModel[];
}
