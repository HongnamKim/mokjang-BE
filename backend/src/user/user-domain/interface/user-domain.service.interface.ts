import { FindOptionsRelations, QueryRunner, UpdateResult } from 'typeorm';
import { UserModel } from '../../entity/user.entity';
import { CreateUserDto } from '../../dto/create-user.dto';
import { ChurchModel } from '../../../churches/entity/church.entity';
import { UpdateUserRoleDto } from '../../dto/request/update-user-role.dto';
import { UpdateUserInfoDto } from '../../dto/request/update-user-info.dto';

export const IUSER_DOMAIN_SERVICE = Symbol('IUserDomainService');

export interface IUserDomainService {
  findUserById(userId: number, qr?: QueryRunner): Promise<UserModel>;

  findUserWithChurchUserById(id: number, qr?: QueryRunner): Promise<UserModel>;

  findUserModelById(
    id: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<UserModel>,
  ): Promise<UserModel>;

  findUserModelByOAuth(
    provider: string,
    providerId: string,
    qr?: QueryRunner,
  ): Promise<UserModel | null>;

  isExistUser(
    provider: string,
    providerId: string,
    qr?: QueryRunner,
  ): Promise<boolean>;

  createUser(dto: CreateUserDto, qr?: QueryRunner): Promise<UserModel>;

  //updateUserInfo(user: UserModel, dto: UpdateUserInfoDto)

  updateUserRole(
    user: UserModel,
    dto: UpdateUserRoleDto,
    qr?: QueryRunner,
  ): Promise<UpdateResult>;

  updateUserInfo(
    user: UserModel,
    dto: UpdateUserInfoDto,
    qr?: QueryRunner,
  ): Promise<UpdateResult>;

  updateUserMobilePhone(
    user: UserModel,
    newMobilePhone: string,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  findMainAdminUser(church: ChurchModel, qr?: QueryRunner): Promise<UserModel>;

  transferOwner(
    beforeMainAdmin: UserModel,
    newMainAdmin: UserModel,
    qr: QueryRunner,
  ): Promise<void>;

  startFreeTrial(user: UserModel, qr: QueryRunner): Promise<UpdateResult>;

  expireTrials(
    expiredUserIds: number[],
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  deleteUser(user: UserModel, qr: QueryRunner): Promise<UpdateResult>;
}
