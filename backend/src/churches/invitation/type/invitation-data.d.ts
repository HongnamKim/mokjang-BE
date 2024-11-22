import { InvitationModel } from '../entity/invitation.entity';

export type InvitationData = Omit<
  InvitationModel,
  | 'id'
  | 'invitedChurchId'
  | 'inviteAttempts'
  | 'validateAttempts'
  | 'mobilePhone'
  | 'name'
  | 'createdAt'
  | 'updatedAt'
  | 'deletedAt'
>;
