import { BaseModel } from '../../common/entity/base.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { ChurchModel } from '../../churches/entity/church.entity';
import { UserModel } from '../../user/entity/user.entity';
import { ChurchJoinRequestStatusEnum } from '../const/church-join-request-status.enum';

@Entity()
export class ChurchJoinModel extends BaseModel {
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
