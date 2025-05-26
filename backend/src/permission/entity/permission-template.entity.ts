import {
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BaseModel, BaseModelColumns } from '../../common/entity/base.entity';
import { ChurchModel } from '../../churches/entity/church.entity';
import { PermissionUnitModel } from './permission-unit.entity';
import { MemberModel } from '../../members/entity/member.entity';

@Entity()
export class PermissionTemplateModel extends BaseModel {
  @Index()
  @Column()
  churchId: number;

  @ManyToOne(() => ChurchModel)
  @JoinColumn({ name: 'churchId' })
  church: ChurchModel;

  @Column()
  title: string;

  @Column({ default: 0 })
  memberCount: number;

  @ManyToMany(() => PermissionUnitModel, (unit) => unit.permissionTemplates)
  @JoinTable()
  permissionUnits: PermissionUnitModel[];

  @OneToMany(() => MemberModel, (member) => member.permissionTemplate)
  members: MemberModel[];
}

export const PermissionTemplateColumns = {
  ...BaseModelColumns,
  churchId: 'churchId',
  church: 'church',
  title: 'title',
  memberCount: 'memberCount',
  permissionUnits: 'permissionUnits',
  members: 'members',
};
