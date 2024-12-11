import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TempUserModel } from '../entity/temp-user.entity';
import { QueryRunner, Repository } from 'typeorm';
import { UserModel } from '../entity/user.entity';
import { OauthDto } from '../dto/oauth.dto';
import { AuthType } from '../enum/auth-type.enum';
import { TokenService } from './token.service';
import { RequestVerificationCodeDto } from '../dto/request-verification-code.dto';
import { ConfigService } from '@nestjs/config';
import { MessagesService } from './messages.service';
import { VerifyCodeDto } from '../dto/verify-code.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(TempUserModel)
    private readonly tempUserRepository: Repository<TempUserModel>,
    @InjectRepository(UserModel)
    private readonly userRepository: Repository<UserModel>,
    private readonly configService: ConfigService,
    private readonly tokenService: TokenService,
    private readonly messagesService: MessagesService,
  ) {}

  private getUserRepository(qr?: QueryRunner) {
    return qr ? qr.manager.getRepository(UserModel) : this.userRepository;
  }

  private getTempUserRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(TempUserModel)
      : this.tempUserRepository;
  }

  async loginUser(oauthDto: OauthDto, qr: QueryRunner) {
    const userRepository = this.getUserRepository(qr);
    //const tempUserRepository = this.getTempUserRepository(qr);

    const user = await userRepository.findOne({
      where: {
        provider: oauthDto.provider,
        providerId: oauthDto.providerId,
      },
    });

    return user
      ? this.handleRegisteredUser(user)
      : this.handleNewUser(oauthDto, qr);
  }

  private handleRegisteredUser(user: UserModel) {
    const accessToken = this.tokenService.signToken(user, AuthType.ACCESS);
    const refreshToken = this.tokenService.signToken(user, AuthType.REFRESH);

    return {
      accessToken,
      refreshToken,
    };
  }

  private async handleNewUser(oauthDto: OauthDto, qr: QueryRunner) {
    const tempUserRepository = this.getTempUserRepository(qr);

    let tempUser = await tempUserRepository.findOne({
      where: {
        provider: oauthDto.provider,
        providerId: oauthDto.providerId,
      },
    });

    if (!tempUser) {
      tempUser = await tempUserRepository.save({
        provider: oauthDto.provider,
        providerId: oauthDto.providerId,
      });
    }

    const token = this.tokenService.signToken(tempUser, AuthType.TEMP);

    return {
      temporal: token,
    };
  }

  async getTempUserById(id: number) {
    const tempUser = await this.tempUserRepository.findOne({
      where: {
        id,
      },
    });

    if (!tempUser) {
      throw new NotFoundException('존재하지 않는 임시유저입니다.');
    }

    return tempUser;
  }

  async getUserById(id: number) {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
    });

    if (!user) {
      throw new NotFoundException('존재하지 않는 유저입니다.');
    }

    return user;
  }

  async requestVerificationCode(
    tempUser: TempUserModel,
    dto: RequestVerificationCodeDto,
    isTest: boolean,
    qr?: QueryRunner,
  ) {
    const tempUserRepository = this.getTempUserRepository(qr);

    // TODO 하루 요청 횟수 제한 검증
    const requestLimits = this.configService.getOrThrow<number>(
      'DAILY_VERIFY_REQUEST_LIMITS',
    );

    if (tempUser.requestAttempts >= requestLimits) {
    }

    const digit = this.configService.getOrThrow<number>('VERIFY_CODE_LENGTH');

    const code = Math.floor(Math.random() * 10 ** digit)
      .toString()
      .padStart(6, '0');

    await tempUserRepository.update(
      { id: tempUser.id },
      {
        verificationCode: code,
        name: dto.name,
        mobilePhone: dto.mobilePhone,
        codeExpiresAt: this.getCodeExpiresAt(),
        isVerified: false,
        verificationAttempts: 0,
        requestAttempts: () => `"requestAttempts" + 1`,
      },
    );

    const message = `목장 인증번호: ${code}`;

    return isTest
      ? message
      : this.messagesService.sendVerificationCode(dto.mobilePhone, message);
  }

  private getCodeExpiresAt() {
    const expiresMinutes = this.configService.getOrThrow<number>(
      'VERIFY_EXPIRES_MINUTES',
    );

    const now = new Date();

    return new Date(now.getTime() + expiresMinutes * 60 * 1000);
  }

  async verifyCode(
    tempUser: TempUserModel,
    dto: VerifyCodeDto,
    qr?: QueryRunner,
  ) {
    // 검증 전처리
    await this.validateVerificationAttempts(tempUser);

    const tempUserRepository = this.getTempUserRepository(qr);

    if (tempUser.verificationCode !== dto.code) {
      const result = await this.tempUserRepository.increment(
        { id: tempUser.id },
        'verificationAttempts',
        1,
      );

      console.log(result.affected);

      throw new BadRequestException(
        '인증번호가 일치하지 않습니다. 다시 확인해주세요.',
      );
    }

    // 인증 성공 로직
    await tempUserRepository.update(
      {
        id: tempUser.id,
      },
      {
        isVerified: true,
      },
    );

    return true;
  }

  private async validateVerificationAttempts(tempUser: TempUserModel) {
    const verificationLimits =
      this.configService.getOrThrow<number>('VERIFY_LIMITS');

    if (tempUser.isVerified) {
      throw new BadRequestException('이미 검증이 완료된 인증번호입니다.');
    }

    if (tempUser.verificationAttempts >= verificationLimits) {
      throw new BadRequestException(
        '검증 시도 횟수를 초과했습니다. 새로운 인증번호를 요청해주세요.',
      );
    }

    if (tempUser.codeExpiresAt < new Date()) {
      throw new BadRequestException(
        '인증번호가 만료되었습니다. 새로운 인증번호를 요청해주세요.',
      );
    }
  }
}
