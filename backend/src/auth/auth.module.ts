import { Module } from '@nestjs/common';
import { AuthService } from './service/auth.service';
import { AuthController } from './controller/auth.controller';
import { GoogleStrategy } from './strategy/google.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModel } from './entity/user.entity';
import { TempUserModel } from './entity/temp-user.entity';
import { JwtModule } from '@nestjs/jwt';
import { TokenService } from './service/token.service';
import { NaverStrategy } from './strategy/naver.strategy';
import { KakaoStrategy } from './strategy/kakao.strategy';
import { UserService } from './service/user.service';
import { UserController } from './controller/user.controller';
import { TempUserService } from './service/temp-user.service';
import { AuthCookieHelper } from './helper/auth-cookie.helper';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserModel, TempUserModel]),
    JwtModule.register({}),
    CommonModule,
  ],
  controllers: [AuthController, UserController],
  providers: [
    AuthService,
    TokenService,
    GoogleStrategy,
    NaverStrategy,
    KakaoStrategy,
    UserService,
    TempUserService,
    AuthCookieHelper,
  ],
  exports: [JwtModule],
})
export class AuthModule {}
