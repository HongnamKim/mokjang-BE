import { QueryRunner, UpdateResult } from 'typeorm';
import { UserModel } from '../../entity/user.entity';
import { CreateUserDto } from '../../dto/create-user.dto';
import { ChurchModel } from '../../../churches/entity/church.entity';
import { UpdateUserDto } from '../../dto/update-user.dto';
import { UserRole } from '../../const/user-role.enum';
import { MemberModel } from '../../../members/entity/member.entity';

export const IUSER_DOMAIN_SERVICE = Symbol('IUserDomainService');

export interface IUserDomainService {
  findUserById(id: number, qr?: QueryRunner): Promise<UserModel>;

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

  isAbleToCreateChurch(user: UserModel): boolean;

  signInChurch(
    user: UserModel,
    church: ChurchModel,
    role: UserRole,
    qr?: QueryRunner,
  ): Promise<UpdateResult>;

  linkMemberToUser(member: MemberModel, user: UserModel): Promise<UserModel>;
}
