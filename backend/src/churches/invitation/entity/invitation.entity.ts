import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { ChurchModel } from '../../entity/church.entity';
import { BaseModel } from '../../../common/entity/base.entity';

@Entity()
export class InvitationModel extends BaseModel {
  @Column()
  @Index()
  invitedChurchId: number;

  @Column()
  @Index()
  name: string;

  @Column()
  @Index()
  mobilePhone: string;

  @Column({ nullable: true })
  guideId?: number;

  @Column({ nullable: true })
  familyId?: number;

  @Column({ default: 1 })
  inviteAttempts: number;

  @Column({ default: 0 })
  validateAttempts: number;

  @Column({ nullable: true, type: 'timestamptz' })
  invitationExpiresAt: Date;

  @Column({ default: false })
  isValidated: boolean;

  @ManyToOne(() => ChurchModel, (church) => church.invitations)
  invitedChurch: ChurchModel;
}
