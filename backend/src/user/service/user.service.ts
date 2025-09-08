import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';
import {
  IUSER_DOMAIN_SERVICE,
  IUserDomainService,
} from '../user-domain/interface/user-domain.service.interface';
import {
  ICHURCH_JOIN_REQUESTS_DOMAIN_SERVICE,
  IChurchJoinRequestDomainService,
} from '../../church-join/church-join-domain/interface/church-join-requests-domain.service.interface';
import { ChurchJoinRequestStatusEnum } from '../../church-join/const/church-join-request-status.enum';
import { UserModel } from '../entity/user.entity';
import {
  ICHURCH_USER_DOMAIN_SERVICE,
  IChurchUserDomainService,
} from '../../church-user/church-user-domain/service/interface/church-user-domain.service.interface';
import { UserRole } from '../const/user-role.enum';
import { UpdateUserInfoDto } from '../dto/request/update-user-info.dto';
import { PatchUserResponseDto } from '../dto/response/patch-user-response.dto';
import { UpdateUserMobilePhoneDto } from '../dto/request/update-user-mobile-phone.dto';
import {
  IMOBILE_VERIFICATION_DOMAIN_SERVICE,
  IMobileVerificationDomainService,
} from '../../mobile-verification/mobile-verification-domain/interface/mobile-verification-domain.service.interface';
import { VerificationType } from '../../mobile-verification/const/verification-type.enum';
import { MessageService } from '../../common/service/message.service';
import { VerifyUserMobilePhoneDto } from '../dto/request/verify-user-mobile-phone.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly dataSource: DataSource,

    @Inject(IUSER_DOMAIN_SERVICE)
    private readonly userDomainService: IUserDomainService,
    @Inject(IMOBILE_VERIFICATION_DOMAIN_SERVICE)
    private readonly mobileVerificationDomainService: IMobileVerificationDomainService,
    private readonly messageService: MessageService,

    @Inject(ICHURCH_JOIN_REQUESTS_DOMAIN_SERVICE)
    private readonly churchJoinRequestsDomainService: IChurchJoinRequestDomainService,
    @Inject(ICHURCH_USER_DOMAIN_SERVICE)
    private readonly churchUserDomainService: IChurchUserDomainService,
  ) {}

  async getUserById(id: number) {
    return this.userDomainService.findUserWithChurchUserById(id);
  }

  async getMyJoinRequest(userId: number, qr?: QueryRunner) {
    const user = await this.userDomainService.findUserWithChurchUserById(
      userId,
      qr,
    );

    return this.churchJoinRequestsDomainService.findMyChurchJoinRequest(
      user,
      qr,
    );
  }

  async updateUserInfo(user: UserModel, dto: UpdateUserInfoDto) {
    await this.userDomainService.updateUserInfo(user, dto);

    const updatedUser = await this.userDomainService.findUserWithChurchUserById(
      user.id,
    );

    return new PatchUserResponseDto(updatedUser);
  }

  async updateUserMobilePhone(
    user: UserModel,
    dto: UpdateUserMobilePhoneDto,
    qr: QueryRunner,
  ) {
    if (user.mobilePhone === dto.mobilePhone) {
      throw new ConflictException('기존과 동일한 휴대전화 번호입니다.');
    }

    const verification =
      await this.mobileVerificationDomainService.createMobileVerification(
        user,
        VerificationType.UPDATE_MOBILE_PHONE,
        dto.mobilePhone,
        qr,
      );

    if (dto.isTest) {
      return verification.verificationCode;
    }

    return this.messageService.sendMessage(
      dto.mobilePhone,
      verification.verificationCode,
    );
  }

  async verifyMobilePhone(
    user: UserModel,
    dto: VerifyUserMobilePhoneDto,
    //qr: QueryRunner,
  ) {
    let newMobilePhone: string;
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      newMobilePhone =
        await this.mobileVerificationDomainService.verifyMobileVerification(
          user,
          VerificationType.UPDATE_MOBILE_PHONE,
          dto.inputCode,
          qr,
        );

      await this.userDomainService.updateUserMobilePhone(
        user,
        newMobilePhone,
        qr,
      );

      const updatedUser =
        await this.userDomainService.findUserWithChurchUserById(user.id, qr);

      await qr.commitTransaction();
      await qr.release();

      return new PatchUserResponseDto(updatedUser);
    } catch (error) {
      if (error instanceof ConflictException) {
        await qr.commitTransaction();
      } else {
        await qr.rollbackTransaction();
      }
      await qr.release();
      throw error;
    }
  }

  async cancelMyJoinRequest(userId: number, qr?: QueryRunner) {
    const user = await this.userDomainService.findUserWithChurchUserById(
      userId,
      qr,
    );

    const joinRequest =
      await this.churchJoinRequestsDomainService.findMyPendingChurchJoinRequest(
        user,
        qr,
      );

    await this.churchJoinRequestsDomainService.updateChurchJoinRequest(
      joinRequest,
      ChurchJoinRequestStatusEnum.CANCELED,
      qr,
    );

    return this.churchJoinRequestsDomainService.findMyChurchJoinRequestById(
      user,
      joinRequest.id,
      qr,
    );
  }

  async getMyPendingJoinRequest(userId: number) {
    const user =
      await this.userDomainService.findUserWithChurchUserById(userId);

    return this.churchJoinRequestsDomainService.findMyPendingChurchJoinRequest(
      user,
    );
  }

  async leaveChurch(user: UserModel, qr: QueryRunner) {
    const churchUser =
      await this.churchUserDomainService.findChurchUserByUserId(user.id, qr);

    await this.churchUserDomainService.leaveChurch(churchUser, qr);
    await this.userDomainService.updateUserRole(
      user,
      { role: UserRole.NONE },
      qr,
    );

    return {
      success: true,
      timestamp: new Date(),
    };
  }

  async deleteUser(user: UserModel, qr: QueryRunner) {
    await this.userDomainService.deleteUser(user, qr);

    return {
      success: true,
      timestamp: new Date(),
    };
  }
}
