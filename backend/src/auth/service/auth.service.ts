import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { TempUserModel } from '../entity/temp-user.entity';
import { QueryRunner } from 'typeorm';
import { UserModel } from '../../user/entity/user.entity';
import { OauthDto } from '../dto/oauth.dto';
import { AuthType } from '../const/enum/auth-type.enum';
import { TokenService } from './token.service';
import { RequestVerificationCodeDto } from '../dto/request-verification-code.dto';
import { ConfigService } from '@nestjs/config';
import { VerifyCodeDto } from '../dto/verify-code.dto';
import { RegisterUserDto } from '../../user/dto/request/register-user.dto';
import {
  AuthException,
  SignInException,
  VerifyException,
} from '../const/exception/auth.exception';
import { JwtTemporalPayload } from '../type/jwt';
import { TestEnvironment } from '../const/enum/test-environment.enum';
import {
  BetaVerificationMessage,
  VerificationMessage,
} from '../const/verification-message.const';
import { CreateUserDto } from '../../user/dto/create-user.dto';
import { UpdateTempUserDto } from '../../user/dto/update-temp-user.dto';
import { ENV_VARIABLE_KEY } from '../../common/const/env.const';
import { MessageService } from '../../common/service/message.service';
import {
  IUSER_DOMAIN_SERVICE,
  IUserDomainService,
} from '../../user/user-domain/interface/user-domain.service.interface';
import {
  ITEMP_USER_DOMAIN_SERVICE,
  ITempUserDomainService,
} from '../temp-user-domain/service/interface/temp-user.service.interface';
import { DateUtils } from '../../common/utils/date-utils.util';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TIME_ZONE } from '../../common/const/time-zone.const';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly tokenService: TokenService,
    private readonly messagesService: MessageService,

    @Inject(IUSER_DOMAIN_SERVICE)
    private readonly userDomainService: IUserDomainService,
    @Inject(ITEMP_USER_DOMAIN_SERVICE)
    private readonly tempUserDomainService: ITempUserDomainService,
  ) {}

  private readonly logger = new Logger(AuthService.name);

  async loginUser(oauthDto: OauthDto, qr: QueryRunner) {
    if (!oauthDto.provider || !oauthDto.providerId) {
      throw new BadRequestException(AuthException.MISSING_OAUTH_DATA);
    }

    const user = await this.userDomainService.findUserModelByOAuth(
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
    let tempUser = await this.tempUserDomainService.findTempUserModelByOAuth(
      oauthDto.provider,
      oauthDto.providerId,
      qr,
    );

    if (!tempUser) {
      tempUser = await this.tempUserDomainService.createTempUser(
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
    const tempUser = await this.tempUserDomainService.getTempUserById(
      temporalToken.id,
      qr,
    );

    // 하루 요청 횟수 제한 검증
    const requestLimits = this.configService.getOrThrow<number>(
      ENV_VARIABLE_KEY.DAILY_VERIFY_REQUEST_LIMITS,
    );

    // 마지막 요청 날짜가 지난 경우, 요청 횟수 초기화
    if (DateUtils.isNewDay(new Date(), tempUser.requestedAt)) {
      tempUser.requestAttempts = 0;
      await this.tempUserDomainService.initRequestAttempt(tempUser, qr);
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
      ENV_VARIABLE_KEY.VERIFY_CODE_LENGTH,
    );

    const code = Math.floor(Math.random() * 10 ** digit)
      .toString()
      .padStart(digit, '0');

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

    await this.tempUserDomainService.updateTempUser(
      tempUser,
      updateTempUserDto,
      qr,
    );

    const message =
      dto.isTest === TestEnvironment.BetaTest
        ? BetaVerificationMessage(code, dto.name, dto.mobilePhone)
        : VerificationMessage(code);

    if (dto.isTest === TestEnvironment.Production) {
      return this.messagesService.sendMessage(dto.mobilePhone, message);
    } else if (dto.isTest === TestEnvironment.BetaTest) {
      return Promise.all([
        // 관리자에게 전송
        this.messagesService.sendMessage(
          this.configService.getOrThrow(ENV_VARIABLE_KEY.BETA_TEST_TO_NUMBER),
          message,
        ),
        // 사용자에게 전송
        this.messagesService.sendMessage(
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
      ENV_VARIABLE_KEY.VERIFY_EXPIRES_MINUTES,
    );

    const now = new Date();

    return new Date(now.getTime() + expiresMinutes * 60 * 1000);
  }

  async verifyCode(temporalToken: JwtTemporalPayload, dto: VerifyCodeDto) {
    const tempUser = await this.tempUserDomainService.getTempUserById(
      temporalToken.id,
    );

    // 검증 전처리
    this.validateVerificationAttempts(tempUser);

    if (tempUser.verificationCode !== dto.code) {
      await this.tempUserDomainService.incrementVerificationAttempts(tempUser);
      throw new BadRequestException(VerifyException.CODE_NOT_MATCH);
    }

    // 인증 성공 로직
    await this.tempUserDomainService.markAsVerified(tempUser);

    return {
      timestamp: new Date(),
      verified: true,
    };
  }

  private validateVerificationAttempts(tempUser: TempUserModel) {
    const verificationLimits = this.configService.getOrThrow<number>(
      ENV_VARIABLE_KEY.VERIFY_LIMITS,
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
    const tempUser = await this.tempUserDomainService.getTempUserById(
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

    const newUser = await this.userDomainService.createUser(createUserDto, qr);

    await this.tempUserDomainService.deleteTempUser(tempUser, qr);

    return this.handleRegisteredUser(newUser);
  }

  @Cron(CronExpression.EVERY_DAY_AT_4AM, { timeZone: TIME_ZONE.SEOUL })
  async cleanUpTempUsers() {
    const result = await this.tempUserDomainService.cleanUp();

    this.logger.log(`${result.affected}개의 TempUser 삭제`);

    return;
  }
}
