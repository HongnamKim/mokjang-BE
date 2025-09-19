import { DeleteResult, QueryRunner, UpdateResult } from 'typeorm';
import { TempUserModel } from '../../../entity/temp-user.entity';
import { UpdateTempUserDto } from '../../../../user/dto/update-temp-user.dto';

export const ITEMP_USER_DOMAIN_SERVICE = Symbol('ITEMP_USER_DOMAIN_SERVICE');

export interface ITempUserDomainService {
  findTempUserModelByOAuth(
    provider: string,
    providerId: string,
    qr?: QueryRunner,
  ): Promise<TempUserModel | null>;

  isExistTempUser(
    provider: string,
    providerId: string,
    qr?: QueryRunner,
  ): Promise<boolean>;

  getTempUserById(id: number, qr?: QueryRunner): Promise<TempUserModel>;

  createTempUser(
    provider: string,
    providerId: string,
    qr?: QueryRunner,
  ): Promise<TempUserModel>;

  initRequestAttempt(
    tempUser: TempUserModel,
    qr?: QueryRunner,
  ): Promise<UpdateResult>;

  updateTempUser(
    tempUser: TempUserModel,
    dto: UpdateTempUserDto,
    qr: QueryRunner,
  ): Promise<TempUserModel | null>;

  incrementVerificationAttempts(
    tempUser: TempUserModel,
    qr?: QueryRunner,
  ): Promise<UpdateResult>;

  markAsVerified(
    tempUser: TempUserModel,
    qr?: QueryRunner,
  ): Promise<UpdateResult>;

  deleteTempUser(
    tempUser: TempUserModel,
    qr?: QueryRunner,
  ): Promise<DeleteResult>;

  cleanUp(): Promise<DeleteResult>;
}
