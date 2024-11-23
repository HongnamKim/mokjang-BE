import { BaseModel } from '../../common/entity/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { InvitationModel } from '../invitation/entity/invitation.entity';
import { BelieverModel } from '../believers/entity/believer.entity';

@Entity()
export class ChurchModel extends BaseModel {
  @Column()
  name: string;

  @Column({ default: 0 })
  dailyInvitationAttempts: number;

  @Column({ nullable: true })
  lastInvitationDate: Date;

  @OneToMany(() => InvitationModel, (invitation) => invitation.invitedChurch)
  invitations: InvitationModel[];

  @OneToMany(() => BelieverModel, (believer) => believer.church)
  believers: BelieverModel[];
}
