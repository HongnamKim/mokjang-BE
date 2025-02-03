import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './service/auth.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { OauthDto } from './dto/oauth.dto';
import { TransactionInterceptor } from '../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';
import { RefreshTokenGuard, TemporalTokenGuard } from './guard/jwt.guard';
import { RefreshToken, TemporalToken } from './decorator/jwt.decorator';
import { RequestVerificationCodeDto } from './dto/request-verification-code.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { JwtRefreshPayload, JwtTemporalPayload } from './type/jwt';
import { TokenService } from './service/token.service';
import {
  OAuthLogin,
  OAuthRedirect,
  OAuthUser,
} from './decorator/auth.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
  ) {}

  @Get('test/sign-in')
  @UseInterceptors(TransactionInterceptor)
  tempUser(
    @Query('provider') provider: string,
    @Query('providerId') providerId: string,
    @QueryRunner() qr: QR,
  ) {
    return this.authService.loginUser(new OauthDto(provider, providerId), qr);
  }

  @OAuthLogin('google')
  loginGoogle() {
    return { msg: 'google login' };
  }

  @OAuthRedirect('google')
  redirectGoogle(@OAuthUser() oauthDto: OauthDto, @QueryRunner() qr: QR) {
    return this.authService.loginUser(oauthDto, qr);
  }

  @OAuthLogin('naver')
  loginNaver() {
    return { msg: 'naver login' };
  }

  @OAuthRedirect('naver')
  redirectNaver(@OAuthUser() oauthDto: OauthDto, @QueryRunner() qr: QR) {
    return this.authService.loginUser(oauthDto, qr);
  }

  @OAuthLogin('kakao')
  loginKakao() {
    return { msg: 'kakao login' };
  }

  @OAuthRedirect('kakao')
  redirectKakao(@OAuthUser() oauthDto: OauthDto, @QueryRunner() qr: QR) {
    return this.authService.loginUser(oauthDto, qr);
  }

  @ApiBearerAuth()
  @Post('verification/request')
  @UseInterceptors(TransactionInterceptor)
  @UseGuards(TemporalTokenGuard)
  requestVerifyCode(
    @TemporalToken() temporalToken: JwtTemporalPayload,
    @Body() dto: RequestVerificationCodeDto,
    @QueryRunner() qr: QR,
  ) {
    return this.authService.requestVerificationCode(temporalToken, dto, qr);
  }

  @ApiBearerAuth()
  @Post('verification/verify')
  @UseGuards(TemporalTokenGuard)
  verifyCode(
    @TemporalToken() temporalToken: JwtTemporalPayload,
    @Body() dto: VerifyCodeDto,
  ) {
    return this.authService.verifyCode(temporalToken, dto);
  }

  @ApiBearerAuth()
  @Post('sign-in')
  @UseGuards(TemporalTokenGuard)
  @UseInterceptors(TransactionInterceptor)
  async signIn(
    @TemporalToken() temporalToken: JwtTemporalPayload,
    @Body() dto: RegisterUserDto,
    @QueryRunner() qr: QR,
  ) {
    return this.authService.signIn(temporalToken, dto, qr);
  }

  @ApiBearerAuth()
  @Post('token/rotate')
  @UseGuards(RefreshTokenGuard)
  refreshToken(@RefreshToken() payload: JwtRefreshPayload) {
    return this.tokenService.rotateToken(payload);
  }
}
