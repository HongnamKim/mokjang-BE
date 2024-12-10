import { Entity, ManyToOne, OneToMany } from 'typeorm';
import { MemberModel } from '../../members/entity/member.entity';
import { ChurchModel } from '../../entity/church.entity';
import { BaseChurchSettingModel } from './base-church-setting.entity';

@Entity()
export class OfficerModel extends BaseChurchSettingModel {
  @ManyToOne(() => ChurchModel, (church) => church.officers)
  church: ChurchModel;

  @OneToMany(() => MemberModel, (member) => member.officer)
  members: MemberModel[];
}
