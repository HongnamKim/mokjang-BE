import { BaseModel } from '../../../common/entity/base.entity';
import { Column, Index } from 'typeorm';

export abstract class BaseChurchSettingModel extends BaseModel {
  @Index()
  @Column()
  churchId: number;

  @Column()
  name: string;

  @Column({ default: 0 })
  believerCount: number;
}
