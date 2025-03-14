import { Column, Index } from 'typeorm';
import { BaseModel } from '../../common/entity/base.entity';

export abstract class BaseChurchSettingModel extends BaseModel {
  @Index()
  @Column()
  churchId: number;

  @Column()
  name: string;

  @Column({ default: 0 })
  membersCount: number;
}
