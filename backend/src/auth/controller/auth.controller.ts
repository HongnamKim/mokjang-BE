import {
  BadRequestException,
  Body,
  Controller,
  DefaultValuePipe,
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
import { OauthDto } from '../dto/oauth.dto';
import { TransactionInterceptor } from '../../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../../common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';
import { RefreshTokenGuard, TemporalTokenGuard } from '../guard/jwt.guard';
import { Token } from '../decorator/jwt.decorator';
import { RequestVerificationCodeDto } from '../dto/request-verification-code.dto';
import { VerifyCodeDto } from '../dto/verify-code.dto';
import { RegisterUserDto } from '../../user/dto/request/register-user.dto';
import { JwtRefreshPayload, JwtTemporalPayload } from '../type/jwt';
import { TokenService } from '../service/token.service';
import {
  OAuthLogin,
  OAuthRedirect,
  OAuthUser,
} from '../decorator/oauth.decorator';
import {
  ApiMobileLoginAuth,
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
import { MobileLoginDto } from '../dto/mobile-login.dto';
import { AuthException } from '../const/exception/auth.exception';
import { LoginOptionEnum } from '../const/enum/login-option.enum';
import { SsoEnum } from '../const/enum/sso.enum';

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
  @Post('test/sign-in')
  @UseInterceptors(TransactionInterceptor)
  async loginTestAuth(
    @Query('provider') provider: string,
    @Query('providerId') providerId: string,
    @Query('loginOption', new DefaultValuePipe(LoginOptionEnum.test))
    loginOption: string,
    @QueryRunner() qr: QR,
    @Res({ passthrough: true }) res: Response,
  ) {
    const loginResult = await this.authService.loginUser(
      new OauthDto(provider, providerId),
      qr,
    );

    if (loginOption === LoginOptionEnum.test) {
      this.clearCookie(res);

      return this.authCookieHelper.handleLoginResult(loginResult, res, true);
    } else if (loginOption === LoginOptionEnum.mobile) {
      return loginResult;
    } else {
      throw new BadRequestException(AuthException.INVALID_LOGIN_OPTION);
    }
  }

  @ApiMobileLoginAuth()
  @Post('mobile-login')
  @UseInterceptors(TransactionInterceptor)
  async mobileLoginAuth(@Body() dto: MobileLoginDto, @QueryRunner() qr: QR) {
    return this.authService.loginUser(
      new OauthDto(dto.provider, dto.providerId),
      qr,
    );
  }

  @Get('cookie-test')
  cookieTest(@Req() req: Request) {
    return req.cookies;
  }

  @Get('temporal-token')
  @UseGuards(TemporalTokenGuard)
  temporalToken(@Token(AuthType.TEMP) temp: JwtTemporalPayload) {
    return !!temp;
  }

  @ApiSSO('구글')
  @OAuthLogin(SsoEnum.google)
  loginGoogle() {
    return { msg: 'google login' };
  }

  @OAuthRedirect(SsoEnum.google)
  async redirectGoogle(
    @OAuthUser() oauthDto: OauthDto,
    @QueryRunner() qr: QR,
    @Res() res: Response,
  ) {
    const loginResult = await this.authService.loginUser(oauthDto, qr);

    this.clearCookie(res);

    return this.authCookieHelper.handleLoginResult(loginResult, res);
  }

  @ApiSSO('네이버')
  @OAuthLogin(SsoEnum.naver)
  loginNaver() {
    return { msg: 'naver login' };
  }

  @OAuthRedirect(SsoEnum.naver)
  async redirectNaver(
    @OAuthUser() oauthDto: OauthDto,
    @QueryRunner() qr: QR,
    @Res() res: Response,
  ) {
    const loginResult = await this.authService.loginUser(oauthDto, qr);

    this.clearCookie(res);

    return this.authCookieHelper.handleLoginResult(loginResult, res);
  }

  @ApiSSO('카카오')
  @OAuthLogin(SsoEnum.kakao)
  loginKakao() {
    return { msg: 'kakao login' };
  }

  @OAuthRedirect(SsoEnum.kakao)
  async redirectKakao(
    @OAuthUser() oauthDto: OauthDto,
    @QueryRunner() qr: QR,
    @Res() res: Response,
  ) {
    const loginResult = await this.authService.loginUser(oauthDto, qr);

    this.clearCookie(res);

    return this.authCookieHelper.handleLoginResult(loginResult, res);
  }

  @ApiRequestVerificationCode()
  @Post('verification/request')
  @UseInterceptors(TransactionInterceptor)
  @UseGuards(TemporalTokenGuard)
  requestVerificationCode(
    @Token(AuthType.TEMP) temporalToken: JwtTemporalPayload,
    @Body() dto: RequestVerificationCodeDto,
    @QueryRunner() qr: QR,
  ) {
    return this.authService.requestVerificationCode(temporalToken, dto, qr);
  }

  @ApiVerifyVerificationCode()
  @Post('verification/verify')
  @UseGuards(TemporalTokenGuard)
  verifyCode(
    @Token(AuthType.TEMP) temporalToken: JwtTemporalPayload,
    @Body() dto: VerifyCodeDto,
  ) {
    return this.authService.verifyCode(temporalToken, dto);
  }

  @ApiSignIn()
  @Post('sign-in')
  @UseGuards(TemporalTokenGuard)
  @UseInterceptors(TransactionInterceptor)
  async signIn(
    @Token(AuthType.TEMP) temporalToken: JwtTemporalPayload,
    @Body() dto: RegisterUserDto,
    @QueryRunner() qr: QR,
    @Res({ passthrough: true }) res: Response,
  ) {
    const signInResult = await this.authService.signIn(temporalToken, dto, qr);

    this.clearCookie(res);

    res.clearCookie(
      this.configService.getOrThrow(ENV_VARIABLE_KEY.TEMPORAL_TOKEN_KEY),
      TOKEN_COOKIE_OPTIONS(this.NODE_ENV, AuthType.TEMP, true),
    );

    this.authCookieHelper.setTokenCookie(signInResult, res);

    return 'sign-in success';
  }

  @ApiRotateToken()
  @Post('token/rotate')
  @UseGuards(RefreshTokenGuard)
  rotateToken(
    @Token(AuthType.REFRESH) payload: JwtRefreshPayload,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = this.tokenService.rotateToken(payload);

    this.authCookieHelper.setTokenCookie(token, res);

    return 'refresh access_token success';
  }

  @Post('logout')
  logOut(@Res({ passthrough: true }) res: Response) {
    this.clearCookie(res);

    return 'logout success';
  }

  private clearCookie(res: Response) {
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
  }
}
