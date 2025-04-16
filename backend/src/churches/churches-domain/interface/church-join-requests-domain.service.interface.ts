import { ChurchModel } from '../../entity/church.entity';
import { UserModel } from '../../../user/entity/user.entity';
import { QueryRunner, UpdateResult } from 'typeorm';
import { ChurchJoinRequestModel } from '../../entity/church-join-request.entity';
import { ChurchJoinRequestStatusEnum } from '../../const/church-join-request-status.enum';

export const ICHURCH_JOIN_REQUESTS_DOMAIN = Symbol(
  'ICHURCH_JOIN_REQUESTS_DOMAIN',
);

export interface IChurchJoinRequestDomainService {
  ensureUserCanRequestJoinChurch(
    user: UserModel,
    qr?: QueryRunner,
  ): Promise<boolean>;

  createChurchJoinRequest(
    church: ChurchModel,
    user: UserModel,
    qr?: QueryRunner,
  ): Promise<ChurchJoinRequestModel>;

  findChurchJoinRequests(
    church: ChurchModel,
    qr?: QueryRunner,
  ): Promise<ChurchJoinRequestModel[]>;

  findChurchJoinRequestById(
    church: ChurchModel,
    joinId: number,
    qr?: QueryRunner,
  ): Promise<ChurchJoinRequestModel>;

  updateChurchJoinRequest(
    joinRequest: ChurchJoinRequestModel,
    status: ChurchJoinRequestStatusEnum,
    qr?: QueryRunner,
  ): Promise<UpdateResult>;

  deleteChurchJoinRequest(
    joinRequest: ChurchJoinRequestModel,
    qr?: QueryRunner,
  ): Promise<UpdateResult>;

  findMyChurchJoinRequest(
    user: UserModel,
    qr?: QueryRunner,
  ): Promise<ChurchJoinRequestModel[]>;

  findMyChurchJoinRequestById(
    user: UserModel,
    joinId: number,
    qr?: QueryRunner,
  ): Promise<ChurchJoinRequestModel>;

  findMyPendingChurchJoinRequest(
    user: UserModel,
    qr?: QueryRunner,
  ): Promise<ChurchJoinRequestModel>;
}
