import { BadRequestException, Injectable } from '@nestjs/common';
import { TempUserModel } from '../entity/temp-user.entity';
import { QueryRunner } from 'typeorm';
import { UserModel } from '../entity/user.entity';
import { OauthDto } from '../dto/auth/oauth.dto';
import { AuthType } from '../const/enum/auth-type.enum';
import { TokenService } from './token.service';
import { RequestVerificationCodeDto } from '../dto/auth/request-verification-code.dto';
import { ConfigService } from '@nestjs/config';
import { MessagesService } from './messages.service';
import { VerifyCodeDto } from '../dto/auth/verify-code.dto';
import { DateUtils } from '../../churches/request-info/utils/date-utils.util';
import { RegisterUserDto } from '../dto/user/register-user.dto';
import {
  AuthException,
  SignInException,
  VerifyException,
} from '../const/exception-message/exception.message';
import { MESSAGE_SERVICE, VERIFICATION } from '../const/env.const';
import { JwtTemporalPayload } from '../type/jwt';
import { TestEnvironment } from '../const/enum/test-environment.enum';
import {
  BetaVerificationMessage,
  VerificationMessage,
} from '../const/verification-message.const';
import { CreateUserDto } from '../dto/user/create-user.dto';
import { UserService } from './user.service';
import { TempUserService } from './temp-user.service';
import { UpdateTempUserDto } from '../dto/user/update-temp-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly tempUserService: TempUserService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly tokenService: TokenService,
    private readonly messagesService: MessagesService,
  ) {}

  async loginUser(oauthDto: OauthDto, qr: QueryRunner) {
    if (!oauthDto.provider || !oauthDto.providerId) {
      throw new BadRequestException(AuthException.MISSING_OAUTH_DATA);
    }

    const user = await this.userService.findUserModelByOAuth(
      oauthDto.provider,
      oauthDto.providerId,
      qr,
    );

    return user
      ? this.handleRegisteredUser(user)
      : this.handleNewUser(oauthDto, qr);
  }

  private handleRegisteredUser(user: UserModel) {
    const accessToken = this.tokenService.signToken(user.id, AuthType.ACCESS);
    const refreshToken = this.tokenService.signToken(user.id, AuthType.REFRESH);

    return {
      accessToken,
      refreshToken,
    };
  }

  private async handleNewUser(oauthDto: OauthDto, qr: QueryRunner) {
    let tempUser = await this.tempUserService.findTempUserModelByOAuth(
      oauthDto.provider,
      oauthDto.providerId,
      qr,
    );

    if (!tempUser) {
      tempUser = await this.tempUserService.createTempUser(
        oauthDto.provider,
        oauthDto.providerId,
        qr,
      );
    }

    const token = this.tokenService.signToken(tempUser.id, AuthType.TEMP);

    return {
      temporal: token,
    };
  }

  async requestVerificationCode(
    temporalToken: JwtTemporalPayload,
    dto: RequestVerificationCodeDto,
    qr: QueryRunner,
  ) {
    const tempUser = await this.tempUserService.getTempUserById(
      temporalToken.id,
      qr,
    );

    // 하루 요청 횟수 제한 검증
    const requestLimits = this.configService.getOrThrow<number>(
      VERIFICATION.DAILY_VERIFY_REQUEST_LIMITS,
    );

    // 마지막 요청 날짜가 지난 경우, 요청 횟수 초기화
    if (DateUtils.isNewDay(new Date(), tempUser.requestedAt)) {
      tempUser.requestAttempts = 0;
      await this.tempUserService.initRequestAttempt(tempUser, qr);
    }

    // 요청 횟수가 초과된 경우
    if (tempUser.requestAttempts >= requestLimits) {
      // 마지막 인증 요청 날짜가 지나지 않은 경우 요청 횟수 초과
      if (!DateUtils.isNewDay(new Date(), tempUser.requestedAt)) {
        throw new BadRequestException(
          VerifyException.DAILY_LIMIT_EXCEEDED(requestLimits),
        );
      }
    }

    const digit = this.configService.getOrThrow<number>(
      VERIFICATION.VERIFY_CODE_LENGTH,
    );

    const code = Math.floor(Math.random() * 10 ** digit)
      .toString()
      .padStart(6, '0');

    const updateTempUserDto: UpdateTempUserDto = {
      verificationCode: code,
      name: dto.name,
      mobilePhone: dto.mobilePhone,
      codeExpiresAt: this.getCodeExpiresAt(),
      isVerified: false,
      verificationAttempts: 0,
      requestAttempts: tempUser.requestAttempts + 1,
      requestedAt: new Date(),
    };

    await this.tempUserService.updateTempUser(tempUser, updateTempUserDto, qr);

    const message =
      dto.isTest === TestEnvironment.BetaTest
        ? BetaVerificationMessage(code, dto.name, dto.mobilePhone)
        : VerificationMessage(code);

    if (dto.isTest === TestEnvironment.Production) {
      return this.messagesService.sendVerificationCode(
        dto.mobilePhone,
        message,
      );
    } else if (dto.isTest === TestEnvironment.BetaTest) {
      return Promise.all([
        // 관리자에게 전송
        this.messagesService.sendVerificationCode(
          this.configService.getOrThrow(MESSAGE_SERVICE.BETA_TEST_TO_NUMBER),
          message,
        ),
        // 사용자에게 전송
        this.messagesService.sendVerificationCode(
          dto.mobilePhone,
          VerificationMessage(code),
        ),
      ]);
    } else {
      return message;
    }
  }

  private getCodeExpiresAt() {
    const expiresMinutes = this.configService.getOrThrow<number>(
      VERIFICATION.VERIFY_EXPIRES_MINUTES,
    );

    const now = new Date();

    return new Date(now.getTime() + expiresMinutes * 60 * 1000);
  }

  async verifyCode(temporalToken: JwtTemporalPayload, dto: VerifyCodeDto) {
    const tempUser = await this.tempUserService.getTempUserById(
      temporalToken.id,
    );

    // 검증 전처리
    this.validateVerificationAttempts(tempUser);

    if (tempUser.verificationCode !== dto.code) {
      await this.tempUserService.incrementVerificationAttempts(tempUser);
      throw new BadRequestException(VerifyException.CODE_NOT_MATCH);
    }

    // 인증 성공 로직
    await this.tempUserService.markAsVerified(tempUser);

    return {
      timestamp: new Date(),
      verified: true,
    };
  }

  private validateVerificationAttempts(tempUser: TempUserModel) {
    const verificationLimits = this.configService.getOrThrow<number>(
      VERIFICATION.VERIFY_LIMITS,
    );

    if (tempUser.isVerified) {
      throw new BadRequestException(VerifyException.ALREADY_VERIFIED);
    }

    if (tempUser.verificationAttempts >= verificationLimits) {
      throw new BadRequestException(VerifyException.EXCEED_VERIFY_LIMITS);
    }

    if (tempUser.codeExpiresAt < new Date()) {
      throw new BadRequestException(VerifyException.CODE_EXPIRED);
    }
  }

  async signIn(
    temporalToken: JwtTemporalPayload,
    dto: RegisterUserDto,
    qr: QueryRunner,
  ) {
    const tempUser = await this.tempUserService.getTempUserById(
      temporalToken.id,
      qr,
    );

    if (!tempUser.isVerified) {
      throw new BadRequestException(
        SignInException.PHONE_VERIFICATION_REQUIRED,
      );
    }

    if (!dto.privacyPolicyAgreed) {
      throw new BadRequestException(SignInException.PRIVACY_POLICY_REQUIRED);
    }

    const createUserDto: CreateUserDto = {
      provider: tempUser.provider,
      providerId: tempUser.providerId,
      name: tempUser.name,
      mobilePhone: tempUser.mobilePhone,
      mobilePhoneVerified: tempUser.isVerified,
      privacyPolicyAgreed: dto.privacyPolicyAgreed,
    };

    const newUser = await this.userService.createUser(createUserDto, qr);

    await this.tempUserService.deleteTempUser(tempUser, qr);

    return this.handleRegisteredUser(newUser);
  }
}
