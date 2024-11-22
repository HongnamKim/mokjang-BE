import { InvitationModel } from '../entity/invitation.entity';

export type InvitationData = Omit<
  InvitationModel,
  | 'id'
  | 'invitedChurchId'
  | 'inviteAttempts'
  | 'mobilePhone'
  | 'name'
  | 'createdAt'
  | 'updatedAt'
  | 'deletedAt'
>;
