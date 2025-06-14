import { UserModel } from '../../../user/entity/user.entity';
import { QueryRunner } from 'typeorm';

export const ICHURCH_JOIN_REQUEST_STATS_DOMAIN_SERVICE = Symbol(
  'ICHURCH_JOIN_REQUEST_STATS_DOMAIN_SERVICE',
);

export interface IChurchJoinRequestStatsDomainService {
  increaseAttemptsCount(user: UserModel, qr?: QueryRunner): Promise<void>;

  getTopRequestUsers(): Promise<any[]>;
}
