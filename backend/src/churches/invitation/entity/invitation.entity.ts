import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { ChurchModel } from '../../entity/church.entity';
import { BaseModel } from '../../../common/entity/base.entity';

@Entity()
export class InvitationModel extends BaseModel {
  @Column()
  @Index()
  invitedChurchId: number;

  @Column()
  name: string;

  @Column()
  mobilePhone: string;

  @Column({ default: 1 })
  inviteAttempts: number;

  @Column({ nullable: true, type: 'timestamptz' })
  invitationExpiresAt: Date;

  @Column({ nullable: true })
  guideId?: number;

  @Column({ nullable: true })
  familyId?: number;

  @ManyToOne(() => ChurchModel, (church) => church.invitations)
  invitedChurch: ChurchModel;
}
