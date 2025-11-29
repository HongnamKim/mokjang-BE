import { BaseModel } from '../../common/entity/base.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { UserModel } from '../../user/entity/user.entity';

@Entity()
export class DeviceModel extends BaseModel {
  @ManyToOne(() => UserModel, (user) => user.devices, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UserModel;

  @Index()
  @Column()
  userId: number;

  @Column()
  token: string;

  @Column()
  deviceId: string; // 기기 식별용 uuid

  @Column()
  platform: 'android' | 'ios';

  @Column()
  isActive: boolean;
}
