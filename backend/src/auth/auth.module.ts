import { Module } from '@nestjs/common';
import { AuthService } from './service/auth.service';
import { AuthController } from './auth.controller';
import { GoogleStrategy } from './strategy/google.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModel } from './entity/user.entity';
import { TempUserModel } from './entity/temp-user.entity';
import { JwtModule } from '@nestjs/jwt';
import { TokenService } from './service/token.service';
import { MessagesService } from './service/messages.service';
import { CoolSMSProvider } from './provider/coolsms.provider';
import { NaverStrategy } from './strategy/naver.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserModel, TempUserModel]),
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    TokenService,
    MessagesService,
    CoolSMSProvider,
    GoogleStrategy,
    NaverStrategy,
  ],
})
export class AuthModule {}
