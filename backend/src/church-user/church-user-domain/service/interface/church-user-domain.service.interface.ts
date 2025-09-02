import { ChurchModel } from '../../../../churches/entity/church.entity';
import { DeleteResult, QueryRunner, UpdateResult } from 'typeorm';
import { UserModel } from '../../../../user/entity/user.entity';
import { GetChurchUsersDto } from '../../../dto/request/get-church-users.dto';
import { MemberModel } from '../../../../members/entity/member.entity';
import { ChurchUserRole } from '../../../../user/const/user-role.enum';
import { ChurchUserModel } from '../../../entity/church-user.entity';
import { ChurchUserDomainPaginationResultDto } from '../../dto/church-user-domain-pagination-result.dto';

export const ICHURCH_USER_DOMAIN_SERVICE = Symbol(
  'ICHURCH_USER_DOMAIN_SERVICE',
);

export interface IChurchUserDomainService {
  /**
   * 계정을 교회에 가입시키고 교인 정보와 연결합니다.
   * @param church 가입하고자 하는 교회
   * @param user 가입 계정
   * @param member 교인 정보
   * @param role 교회 내의 역할
   * @param qr QueryRunner
   */
  createChurchUser(
    church: ChurchModel,
    user: UserModel,
    member: MemberModel,
    role: ChurchUserRole,
    qr: QueryRunner,
  ): Promise<ChurchUserModel>;

  assertCanRequestJoinChurch(
    user: UserModel,
    qr?: QueryRunner,
  ): Promise<boolean>;

  // 권한 인증용
  findChurchUserByUserId(
    userId: number,
    qr?: QueryRunner,
  ): Promise<ChurchUserModel>;

  findChurchUsers(
    church: ChurchModel,
    dto: GetChurchUsersDto,
    qr?: QueryRunner,
  ): Promise<ChurchUserDomainPaginationResultDto>;

  findChurchUserById(
    church: ChurchModel,
    churchUserId: number,
    qr?: QueryRunner,
  ): Promise<ChurchUserModel>;

  findChurchUserByUser(
    church: ChurchModel,
    user: UserModel,
    qr?: QueryRunner,
  ): Promise<ChurchUserModel>;

  updateChurchUserRole(
    churchUser: ChurchUserModel,
    role: ChurchUserRole,
    qr?: QueryRunner,
  ): Promise<UpdateResult>;

  leaveChurch(
    churchUser: ChurchUserModel,
    qr?: QueryRunner,
  ): Promise<UpdateResult>;

  deleteChurchUserCascade(
    church: ChurchModel,
    qr: QueryRunner,
  ): Promise<DeleteResult>;
}
