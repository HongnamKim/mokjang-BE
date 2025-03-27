import { Module } from '@nestjs/common';
import { AuthService } from './service/auth.service';
import { AuthController } from './controller/auth.controller';
import { GoogleStrategy } from './strategy/google.strategy';
import { TokenService } from './service/token.service';
import { NaverStrategy } from './strategy/naver.strategy';
import { KakaoStrategy } from './strategy/kakao.strategy';
import { AuthCookieHelper } from './helper/auth-cookie.helper';
import { CommonModule } from '../common/common.module';
import { UserDomainModule } from '../user/user-domain/user-domain.module';
import { TempUserDomainModule } from './temp-user-domain/temp-user-domain.module';

@Module({
  imports: [
    //TypeOrmModule.forFeature([TempUserModel]),
    //JwtModule.register({}),
    CommonModule,
    UserDomainModule,
    TempUserDomainModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    TokenService,
    GoogleStrategy,
    NaverStrategy,
    KakaoStrategy,
    AuthCookieHelper,
  ],
  exports: [
    /*JwtModule*/
  ],
})
export class AuthModule {}
