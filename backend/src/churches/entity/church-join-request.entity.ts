import { BaseModel } from '../../common/entity/base.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { ChurchModel } from './church.entity';
import { UserModel } from '../../user/entity/user.entity';
import { ChurchJoinRequestStatusEnum } from '../const/church-join-request-status.enum';

@Entity()
export class ChurchJoinRequestModel extends BaseModel {
  @Index()
  @Column()
  churchId: number;

  @ManyToOne(() => ChurchModel, (church) => church.joinRequests)
  church: ChurchModel;

  @Index()
  @Column()
  userId: number;

  @ManyToOne(() => UserModel, (user) => user.joinRequest)
  @JoinColumn({ name: 'userId' })
  user: UserModel;

  @Column({
    default: ChurchJoinRequestStatusEnum.PENDING,
  })
  status: ChurchJoinRequestStatusEnum;
}
