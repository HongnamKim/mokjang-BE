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
import { JwtGuard } from './guard/jwt.guard';
import { JwtDecorator } from './decorator/jwt.decorator';
import { TempUserModel } from './entity/temp-user.entity';
import { RequestVerificationCodeDto } from './dto/request-verification-code.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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

  @Get('google/redirect')
  @ApiExcludeEndpoint()
  @UseGuards(AuthGuard('google'))
  @UseInterceptors(TransactionInterceptor)
  redirectGoogle(@OAuthUser() oauthDto: OauthDto, @QueryRunner() qr: QR) {
    return this.authService.loginUser(oauthDto, qr);
  }

  @Post('verification/request')
  @ApiBearerAuth()
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

  @Post('verification/verify')
  @ApiBearerAuth()
  //@UseInterceptors(TransactionInterceptor)
  @UseGuards(JwtGuard)
  verifyCode(
    @JwtDecorator() tempUser: TempUserModel,
    @Body() dto: VerifyCodeDto,
    @Query('expireTest', ParseBoolPipe) expireTest: boolean,
    //@QueryRunner() qr: QR,
  ) {
    return this.authService.verifyCode(tempUser, dto);
  }
}
