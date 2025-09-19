import { UserModel } from '../../../user/entity/user.entity';
import { VerificationType } from '../../const/verification-type.enum';
import { DeleteResult, QueryRunner } from 'typeorm';
import { MobileVerificationModel } from '../../entity/mobile-verification.entity';

export const IMOBILE_VERIFICATION_DOMAIN_SERVICE = Symbol(
  'IMOBILE_VERIFICATION_DOMAIN_SERVICE',
);

export interface IMobileVerificationDomainService {
  createMobileVerification(
    user: UserModel,
    verificationType: VerificationType,
    mobilePhone: string,
    qr?: QueryRunner,
  ): Promise<MobileVerificationModel>;

  verifyMobileVerification(
    user: UserModel,
    verificationType: VerificationType,
    input: string,
    qr?: QueryRunner,
  ): Promise<string>;

  findVerifiedRequest(
    user: UserModel,
    verificationType: VerificationType,
    qr: QueryRunner,
  ): Promise<MobileVerificationModel>;

  cleanUp(): Promise<DeleteResult>;
}
