import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { DomainType } from '../const/domain-type.enum';
import { DomainAction } from '../const/domain-action.enum';
import { PermissionTemplateModel } from './permission-template.entity';
import { Exclude } from 'class-transformer';

@Entity()
@Unique(['domain', 'action'])
export class PermissionUnitModel {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  @Exclude({ toPlainOnly: true })
  createdAt: Date;

  @UpdateDateColumn()
  @Exclude({ toPlainOnly: true })
  updatedAt: Date;

  @Column({ type: 'varchar' })
  domain: DomainType;

  @Column({ type: 'varchar' })
  action: DomainAction;

  @ManyToMany(
    () => PermissionTemplateModel,
    (template) => template.permissionUnits,
  )
  permissionTemplates: PermissionTemplateModel[];
}
