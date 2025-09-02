import {
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
} from 'typeorm';
import { BaseModel, BaseModelColumns } from '../../common/entity/base.entity';
import { ChurchModel } from '../../churches/entity/church.entity';
import { PermissionUnitModel } from './permission-unit.entity';

@Entity()
export class PermissionTemplateModel extends BaseModel {
  @Index()
  @Column()
  churchId: number;

  @ManyToOne(() => ChurchModel, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'churchId' })
  church: ChurchModel;

  @Column()
  title: string;

  @Column({ default: 0 })
  memberCount: number;

  @ManyToMany(() => PermissionUnitModel, (unit) => unit.permissionTemplates)
  @JoinTable()
  permissionUnits: PermissionUnitModel[];
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
