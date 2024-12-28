import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseModel } from '../../../common/entity/base.entity';
import { GroupModel } from './group.entity';

@Entity()
export class GroupRoleModel extends BaseModel {
  @Column()
  role: string;

  @ManyToOne(() => GroupModel, (group) => group.roles)
  group: GroupModel;
}
