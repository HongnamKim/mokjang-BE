import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseModel } from '../../common/entity/base.entity';
import { ChurchUserModel } from '../../church-user/entity/church-user.entity';
import { NotificationDomain } from '../const/notification-domain.enum';
import { NotificationAction } from '../const/notification-action.enum';
import { NotificationFields } from '../notification-event.dto';

@Entity()
@Index(['churchUserId', 'isRead', 'createdAt'])
@Index(['churchUserId', 'createdAt'])
@Index(['domain', 'action', 'churchUserId'])
export class NotificationModel extends BaseModel {
  @Index()
  @Column()
  churchUserId: number;

  @ManyToOne(() => ChurchUserModel, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'churchUserId' })
  churchUser: ChurchUserModel;

  @Column({ default: '' })
  actorName: string;

  @Column({ nullable: true })
  domain: NotificationDomain;

  @Column({ nullable: true })
  action: NotificationAction;

  @Column({ default: '' })
  domainTitle: string;

  @Column({ default: false })
  isRead: boolean;

  @Column({ type: 'jsonb', nullable: true })
  payload: NotificationFields[];

  @Column({ type: 'jsonb', nullable: true })
  sourceInfo: any | null;

  @Column({ type: 'timestamptz' })
  expiresAt: Date;
}
