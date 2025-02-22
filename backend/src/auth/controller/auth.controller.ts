import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { OauthDto } from '../dto/auth/oauth.dto';
import { TransactionInterceptor } from '../../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../../common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';
import { RefreshTokenGuard, TemporalTokenGuard } from '../guard/jwt.guard';
import { RefreshToken, TemporalToken } from '../decorator/jwt.decorator';
import { RequestVerificationCodeDto } from '../dto/auth/request-verification-code.dto';
import { VerifyCodeDto } from '../dto/auth/verify-code.dto';
import { RegisterUserDto } from '../dto/user/register-user.dto';
import { JwtRefreshPayload, JwtTemporalPayload } from '../type/jwt';
import { TokenService } from '../service/token.service';
import {
  OAuthLogin,
  OAuthRedirect,
  OAuthUser,
} from '../decorator/auth.decorator';
import {
  ApiRequestVerificationCode,
  ApiRotateToken,
  ApiSignIn,
  ApiSSO,
  ApiTestAuth,
  ApiVerifyVerificationCode,
} from '../const/swagger/auth/controller.swagger';
import { Response } from 'express';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
  ) {}

  @ApiTestAuth()
  @Get('test/sign-in')
  @UseInterceptors(TransactionInterceptor)
  loginTestAuth(
    @Query('provider') provider: string,
    @Query('providerId') providerId: string,
    @QueryRunner() qr: QR,
  ) {
    return this.authService.loginUser(new OauthDto(provider, providerId), qr);
  }

  @ApiSSO('구글')
  @OAuthLogin('google')
  loginGoogle() {
    return { msg: 'google login' };
  }

  @OAuthRedirect('google')
  async redirectGoogle(
    @OAuthUser() oauthDto: OauthDto,
    @QueryRunner() qr: QR,
    @Res() res: Response,
  ) {
    const loginResult = await this.authService.loginUser(oauthDto, qr);

    console.log(Object.keys(loginResult));

    if (Object.keys(loginResult).includes('temporal')) {
      res.cookie('jwt', loginResult, { httpOnly: true, sameSite: 'none' });

      res.redirect(`http://localhost:3001/login/register`);
    } else {
      res.cookie('jwt', loginResult, { httpOnly: true, sameSite: 'none' });

      res.redirect(`http://localhost:3001`);
    }

    //res.cookie('JWT', loginResult, { httpOnly: true });

    //res.redirect('http://localhost:3000');
  }

  @ApiSSO('네이버')
  @OAuthLogin('naver')
  loginNaver() {
    return { msg: 'naver login' };
  }

  @OAuthRedirect('naver')
  redirectNaver(@OAuthUser() oauthDto: OauthDto, @QueryRunner() qr: QR) {
    return this.authService.loginUser(oauthDto, qr);
  }

  @ApiSSO('카카오')
  @OAuthLogin('kakao')
  loginKakao() {
    return { msg: 'kakao login' };
  }

  @OAuthRedirect('kakao')
  redirectKakao(@OAuthUser() oauthDto: OauthDto, @QueryRunner() qr: QR) {
    return this.authService.loginUser(oauthDto, qr);
  }

  @ApiRequestVerificationCode()
  @ApiBearerAuth()
  @Post('verification/request')
  @UseInterceptors(TransactionInterceptor)
  @UseGuards(TemporalTokenGuard)
  requestVerificationCode(
    @TemporalToken() temporalToken: JwtTemporalPayload,
    @Body() dto: RequestVerificationCodeDto,
    @QueryRunner() qr: QR,
  ) {
    return this.authService.requestVerificationCode(temporalToken, dto, qr);
  }

  @ApiVerifyVerificationCode()
  @ApiBearerAuth()
  @Post('verification/verify')
  @UseGuards(TemporalTokenGuard)
  verifyCode(
    @TemporalToken() temporalToken: JwtTemporalPayload,
    @Body() dto: VerifyCodeDto,
  ) {
    return this.authService.verifyCode(temporalToken, dto);
  }

  @ApiSignIn()
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

  @ApiRotateToken()
  @ApiBearerAuth()
  @Post('token/rotate')
  @UseGuards(RefreshTokenGuard)
  rotateToken(@RefreshToken() payload: JwtRefreshPayload) {
    return this.tokenService.rotateToken(payload);
  }
}
