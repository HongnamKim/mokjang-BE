import { IMobileVerificationDomainService } from '../interface/mobile-verification-domain.service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { MobileVerificationModel } from '../../entity/mobile-verification.entity';
import { Between, LessThan, QueryRunner, Repository } from 'typeorm';
import { UserModel } from '../../../user/entity/user.entity';
import { VerificationType } from '../../const/verification-type.enum';
import { TIME_ZONE } from '../../../common/const/time-zone.const';
import {
  getEndOfToday,
  getStartOfToday,
} from '../../../member-history/history-date.utils';
import {
  MAX_VERIFICATION_REQUEST,
  VERIFICATION_CODE_EXPIRE_TIME,
  VERIFICATION_CODE_LENGTH,
} from '../../const/verification.constraint';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { addMinutes, subDays } from 'date-fns';
import { MobileVerificationException } from '../../exception/mobile-verification.exception';

export class MobileVerificationDomainService
  implements IMobileVerificationDomainService
{
  constructor(
    @InjectRepository(MobileVerificationModel)
    private readonly repository: Repository<MobileVerificationModel>,
  ) {}

  private getRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(MobileVerificationModel)
      : this.repository;
  }

  async createMobileVerification(
    user: UserModel,
    verificationType: VerificationType,
    mobilePhone: string,
    qr?: QueryRunner,
  ) {
    const repository = this.getRepository(qr);

    const startOfDay = getStartOfToday(TIME_ZONE.SEOUL);
    const endOfDay = getEndOfToday(TIME_ZONE.SEOUL);

    const todayVerifications = await repository.find({
      where: {
        userId: user.id,
        createdAt: Between(startOfDay, endOfDay),
        verificationType,
      },
    });

    if (todayVerifications.length >= MAX_VERIFICATION_REQUEST) {
      throw new ConflictException(
        MobileVerificationException.EXCEED_MAX_VERIFICATION_REQUEST,
      );
    }

    await repository.update(
      { userId: user.id, verificationType: verificationType, isActive: true },
      {
        isActive: false,
      },
    );

    // 6 자리 코드 생성
    const verificationCode = Math.floor(
      Math.random() * 10 ** VERIFICATION_CODE_LENGTH,
    )
      .toString()
      .padStart(VERIFICATION_CODE_LENGTH, '0');

    return repository.save({
      userId: user.id,
      verificationType,
      verificationCode,
      mobilePhone: mobilePhone,
      expiresAt: addMinutes(new Date(), VERIFICATION_CODE_EXPIRE_TIME),
    });
  }

  async verifyMobileVerification(
    user: UserModel,
    verificationType: VerificationType,
    input: string,
    qr?: QueryRunner,
  ) {
    const repository = this.getRepository(qr);

    const verification = await repository.findOne({
      where: {
        userId: user.id,
        verificationType,
        isActive: true,
      },
    });

    if (!verification) {
      throw new NotFoundException(MobileVerificationException.NOT_FOUND);
    }

    if (verification.expiresAt < new Date()) {
      throw new ConflictException('유효 시간 초과');
    }

    if (verification.attemptCount >= 5) {
      throw new ConflictException(
        MobileVerificationException.EXCEED_MAX_VERIFICATION_ATTEMPTS,
      );
    }

    if (verification.isVerified) {
      throw new ConflictException(MobileVerificationException.ALREADY_VERIFIED);
    }

    if (verification.verificationCode === input) {
      // 인증번호 일치 --> 성공
      await repository.update(
        { id: verification.id },
        {
          attemptCount: () => 'attemptCount + 1',
          isVerified: true,
        },
      );

      return verification.mobilePhone;
    } else {
      // 인증번호 불일치 --> 실패
      await repository.update(
        { id: verification.id },
        {
          attemptCount: () => 'attemptCount + 1',
        },
      );

      throw new ConflictException('인증 번호가 일치하지 않습니다.');
    }
  }

  async cleanUp() {
    const repository = this.getRepository();

    const yesterday = subDays(getStartOfToday(TIME_ZONE.SEOUL), 1);

    return repository.delete({ expiresAt: LessThan(yesterday) });
  }
}
