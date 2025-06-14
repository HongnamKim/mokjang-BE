import { ChurchModel } from '../../../churches/entity/church.entity';
import { UserModel } from '../../../user/entity/user.entity';
import { QueryRunner, UpdateResult } from 'typeorm';
import { ChurchJoinModel } from '../../entity/church-join.entity';
import { ChurchJoinRequestStatusEnum } from '../../const/church-join-request-status.enum';
import { GetJoinRequestDto } from '../../dto/get-join-request.dto';

export const ICHURCH_JOIN_REQUESTS_DOMAIN_SERVICE = Symbol(
  'ICHURCH_JOIN_REQUESTS_DOMAIN_SERVICE',
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
  ): Promise<ChurchJoinModel>;

  findChurchJoinRequests(
    church: ChurchModel,
    dto: GetJoinRequestDto,
    qr?: QueryRunner,
  ): Promise<{ data: ChurchJoinModel[]; totalCount: number }>;

  findChurchJoinRequestById(
    church: ChurchModel,
    joinId: number,
    qr?: QueryRunner,
  ): Promise<ChurchJoinModel>;

  updateChurchJoinRequest(
    joinRequest: ChurchJoinModel,
    status: ChurchJoinRequestStatusEnum,
    qr?: QueryRunner,
  ): Promise<UpdateResult>;

  deleteChurchJoinRequest(
    joinRequest: ChurchJoinModel,
    qr?: QueryRunner,
  ): Promise<UpdateResult>;

  findMyChurchJoinRequest(
    user: UserModel,
    qr?: QueryRunner,
  ): Promise<ChurchJoinModel[]>;

  findMyChurchJoinRequestById(
    user: UserModel,
    joinId: number,
    qr?: QueryRunner,
  ): Promise<ChurchJoinModel>;

  findMyPendingChurchJoinRequest(
    user: UserModel,
    qr?: QueryRunner,
  ): Promise<ChurchJoinModel>;
}
