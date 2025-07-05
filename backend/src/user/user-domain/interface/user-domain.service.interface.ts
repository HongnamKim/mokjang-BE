import { QueryRunner, UpdateResult } from 'typeorm';
import { UserModel } from '../../entity/user.entity';
import { CreateUserDto } from '../../dto/create-user.dto';
import { ChurchModel } from '../../../churches/entity/church.entity';
import { UpdateUserDto } from '../../dto/update-user.dto';

export const IUSER_DOMAIN_SERVICE = Symbol('IUserDomainService');

export interface IUserDomainService {
  findUserById(userId: number, qr?: QueryRunner): Promise<UserModel>;

  findUserModelById(id: number, qr?: QueryRunner): Promise<UserModel>;

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

  updateUser(
    user: UserModel,
    dto: UpdateUserDto,
    qr?: QueryRunner,
  ): Promise<UpdateResult>;

  findMainAdminUser(church: ChurchModel, qr?: QueryRunner): Promise<UserModel>;

  transferOwner(
    beforeMainAdmin: UserModel,
    newMainAdmin: UserModel,
    qr: QueryRunner,
  ): Promise<void>;
}
