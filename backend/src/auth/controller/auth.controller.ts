import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { ApiTags } from '@nestjs/swagger';
import { OauthDto } from '../dto/auth/oauth.dto';
import { TransactionInterceptor } from '../../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../../common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';
import { RefreshTokenGuardV2, TemporalTokenGuardV2 } from '../guard/jwt.guard';
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
} from '../decorator/oauth.decorator';
import {
  ApiRequestVerificationCode,
  ApiRotateToken,
  ApiSignIn,
  ApiSSO,
  ApiTestAuth,
  ApiVerifyVerificationCode,
} from '../const/swagger/auth/controller.swagger';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { TOKEN_COOKIE_OPTIONS } from '../const/token-cookie-option.const';
import { AuthType } from '../const/enum/auth-type.enum';
import { AuthCookieHelper } from '../helper/auth-cookie.helper';
import { ENV_VARIABLE_KEY } from '../../common/const/env.const';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
    private readonly configService: ConfigService,
    private readonly authCookieHelper: AuthCookieHelper,
  ) {}

  private NODE_ENV = this.configService.getOrThrow(ENV_VARIABLE_KEY.NODE_ENV);

  @ApiTestAuth()
  @Get('test/sign-in')
  @UseInterceptors(TransactionInterceptor)
  async loginTestAuth(
    @Query('provider') provider: string,
    @Query('providerId') providerId: string,
    @QueryRunner() qr: QR,
    @Res({ passthrough: true }) res: Response,
  ) {
    const loginResult = await this.authService.loginUser(
      new OauthDto(provider, providerId),
      qr,
    );
    return this.authCookieHelper.handleLoginResult(loginResult, res, true);
  }

  @Get('cookie-test')
  cookieTest(@Req() req: Request) {
    return req.cookies;
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

    return this.authCookieHelper.handleLoginResult(loginResult, res);
  }

  @ApiSSO('네이버')
  @OAuthLogin('naver')
  loginNaver() {
    return { msg: 'naver login' };
  }

  @OAuthRedirect('naver')
  async redirectNaver(
    @OAuthUser() oauthDto: OauthDto,
    @QueryRunner() qr: QR,
    @Res() res: Response,
  ) {
    const loginResult = await this.authService.loginUser(oauthDto, qr);

    return this.authCookieHelper.handleLoginResult(loginResult, res);
  }

  @ApiSSO('카카오')
  @OAuthLogin('kakao')
  loginKakao() {
    return { msg: 'kakao login' };
  }

  @OAuthRedirect('kakao')
  async redirectKakao(
    @OAuthUser() oauthDto: OauthDto,
    @QueryRunner() qr: QR,
    @Res() res: Response,
  ) {
    const loginResult = await this.authService.loginUser(oauthDto, qr);

    return this.authCookieHelper.handleLoginResult(loginResult, res);
  }

  @ApiRequestVerificationCode()
  //@ApiBearerAuth()
  @Post('verification/request')
  @UseInterceptors(TransactionInterceptor)
  @UseGuards(TemporalTokenGuardV2)
  requestVerificationCode(
    @TemporalToken() temporalToken: JwtTemporalPayload,
    @Body() dto: RequestVerificationCodeDto,
    @QueryRunner() qr: QR,
  ) {
    return this.authService.requestVerificationCode(temporalToken, dto, qr);
  }

  @ApiVerifyVerificationCode()
  //@ApiBearerAuth()
  @Post('verification/verify')
  @UseGuards(TemporalTokenGuardV2)
  verifyCode(
    @TemporalToken() temporalToken: JwtTemporalPayload,
    @Body() dto: VerifyCodeDto,
  ) {
    return this.authService.verifyCode(temporalToken, dto);
  }

  @ApiSignIn()
  //@ApiBearerAuth()
  @Post('sign-in')
  @UseGuards(TemporalTokenGuardV2)
  @UseInterceptors(TransactionInterceptor)
  async signIn(
    @TemporalToken() temporalToken: JwtTemporalPayload,
    @Body() dto: RegisterUserDto,
    @QueryRunner() qr: QR,
    @Res({ passthrough: true }) res: Response,
  ) {
    const signInResult = await this.authService.signIn(temporalToken, dto, qr);

    res.clearCookie(
      this.configService.getOrThrow(ENV_VARIABLE_KEY.TEMPORAL_TOKEN_KEY),
      TOKEN_COOKIE_OPTIONS(this.NODE_ENV, AuthType.TEMP, true),
    );

    this.authCookieHelper.setTokenCookie(signInResult, res);

    return 'sign-in success';
  }

  @ApiRotateToken()
  //@ApiBearerAuth()
  @Post('token/rotate')
  @UseGuards(RefreshTokenGuardV2)
  rotateToken(
    @RefreshToken() payload: JwtRefreshPayload,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = this.tokenService.rotateToken(payload);

    this.authCookieHelper.setTokenCookie(token, res);

    return 'refresh access_token success';
  }

  @Post('logout')
  logOut(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(
      this.configService.getOrThrow(ENV_VARIABLE_KEY.ACCESS_TOKEN_KEY),
      TOKEN_COOKIE_OPTIONS(this.NODE_ENV, AuthType.ACCESS, true),
    );
    res.clearCookie(
      this.configService.getOrThrow(ENV_VARIABLE_KEY.REFRESH_TOKEN_KEY),
      TOKEN_COOKIE_OPTIONS(this.NODE_ENV, AuthType.REFRESH, true),
    );
    res.clearCookie(
      this.configService.getOrThrow(ENV_VARIABLE_KEY.TEMPORAL_TOKEN_KEY),
      TOKEN_COOKIE_OPTIONS(this.NODE_ENV, AuthType.TEMP, true),
    );

    return 'logout success';
  }
}
