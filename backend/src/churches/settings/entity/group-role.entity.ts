import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { BaseModel } from '../../../common/entity/base.entity';
import { GroupModel } from './group.entity';
import { ChurchModel } from '../../entity/church.entity';

@Entity()
export class GroupRoleModel extends BaseModel {
  @Column()
  role: string;

  @Index()
  @Column()
  groupId: number;

  @ManyToOne(() => GroupModel, (group) => group.roles)
  group: GroupModel;

  @Index()
  @Column()
  churchId: number;

  @ManyToOne(() => ChurchModel, (church) => church.groupRoles)
  church: ChurchModel;
}
