import {
  Body,
  Controller,
  Get,
  ParseBoolPipe,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './service/auth.service';
import { ApiBearerAuth, ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { OauthDto } from './dto/oauth.dto';
import { OAuthUser } from './decorator/oauth-user.decorator';
import { TransactionInterceptor } from '../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';
import { JwtGuard, RefreshTokenGuard } from './guard/jwt.guard';
import { JwtDecorator } from './decorator/jwt.decorator';
import { TempUserModel } from './entity/temp-user.entity';
import { RequestVerificationCodeDto } from './dto/request-verification-code.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { JwtRefreshPayload } from './type/jwt';
import { TokenService } from './service/token.service';

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

  @Get('login/google')
  @UseGuards(AuthGuard('google'))
  loginGoogle() {
    return { msg: 'google login' };
  }

  @Get('login/google/redirect')
  @ApiExcludeEndpoint()
  @UseGuards(AuthGuard('google'))
  @UseInterceptors(TransactionInterceptor)
  redirectGoogle(@OAuthUser() oauthDto: OauthDto, @QueryRunner() qr: QR) {
    return this.authService.loginUser(oauthDto, qr);
  }

  @Get('login/naver')
  @UseGuards(AuthGuard('naver'))
  loginNaver() {
    return { msg: 'naver login' };
  }

  @Get('login/naver/redirect')
  @ApiExcludeEndpoint()
  @UseGuards(AuthGuard('naver'))
  @UseInterceptors(TransactionInterceptor)
  redirectNaver(@OAuthUser() oauthDto: OauthDto, @QueryRunner() qr: QR) {
    return this.authService.loginUser(oauthDto, qr);
  }

  @ApiBearerAuth()
  @Post('verification/request')
  @UseInterceptors(TransactionInterceptor)
  @UseGuards(JwtGuard)
  requestVerifyCode(
    @JwtDecorator() tempUser: TempUserModel,
    @Query('isTest', ParseBoolPipe) isTest: boolean,
    @Body() dto: RequestVerificationCodeDto,
    @QueryRunner() qr: QR,
  ) {
    return this.authService.requestVerificationCode(tempUser, dto, isTest, qr);
  }

  @ApiBearerAuth()
  @Post('verification/verify')
  @UseGuards(JwtGuard)
  verifyCode(
    @JwtDecorator() tempUser: TempUserModel,
    @Body() dto: VerifyCodeDto,
  ) {
    return this.authService.verifyCode(tempUser, dto);
  }

  @ApiBearerAuth()
  @Post('sign-in')
  @UseGuards(JwtGuard)
  @UseInterceptors(TransactionInterceptor)
  async signIn(
    @JwtDecorator() tempUser: TempUserModel,
    @Body() dto: RegisterUserDto,
    @QueryRunner() qr: QR,
  ) {
    return this.authService.signIn(tempUser, dto, qr);
  }

  @ApiBearerAuth()
  @Post('token/rotate')
  @UseGuards(RefreshTokenGuard)
  refreshToken(@JwtDecorator() payload: JwtRefreshPayload) {
    return this.tokenService.rotateToken(payload);
  }
}
