import { Entity, ManyToOne, OneToMany } from 'typeorm';
import { MemberModel } from '../../members/entity/member.entity';
import { ChurchModel } from '../../entity/church.entity';
import { BaseChurchSettingModel } from './base-church-setting.entity';

@Entity()
export class MinistryModel extends BaseChurchSettingModel {
  @ManyToOne(() => ChurchModel, (church) => church.ministries)
  church: ChurchModel;

  @OneToMany(() => MemberModel, (member) => member.ministries)
  members: MemberModel[];
}
