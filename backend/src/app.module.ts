import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ChurchesModule } from './churches/churches.module';
import { ChurchModel } from './churches/entity/church.entity';
import { RequestInfoModel } from './churches/request-info/entity/request-info.entity';
import { MemberModel } from './churches/members/entity/member.entity';
import { RequestInfoModule } from './churches/request-info/request-info.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { MembersModule } from './churches/members/members.module';
import { MembersSettingsModule } from './churches/members-settings/members-settings.module';
import { EducationModel } from './churches/settings/entity/education.entity';
import { OfficerModel } from './churches/settings/entity/officer.entity';
import { MinistryModel } from './churches/settings/entity/ministry.entity';
import { GroupModel } from './churches/settings/entity/group.entity';
import { SettingsModule } from './churches/settings/settings.module';
import { FamilyModel } from './churches/members/entity/family.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import * as Joi from 'joi';
import { TempUserModel } from './auth/entity/temp-user.entity';
import { UserModel } from './auth/entity/user.entity';
import { GroupRoleModel } from './churches/settings/entity/group-role.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        // DB
        DB_TYPE: Joi.string().valid('postgres').required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_DATABASE: Joi.string().required(),
        // 정보 요청
        DAILY_REQUEST_INFO_LIMITS: Joi.number().required(),
        DAILY_REQUEST_INFO_RETRY_LIMITS: Joi.number().required(),
        REQUEST_INFO_EXPIRE_DAYS: Joi.number().required(),
        REQUEST_INFO_VALIDATION_LIMITS: Joi.number().required(),
        // 네트워크
        PROTOCOL: Joi.string().required(),
        HOST: Joi.string().required(),
        PORT: Joi.number().required(),
        // 메시지 API
        SMS_API_KEY: Joi.string().required(),
        SMS_API_SECRET: Joi.string().required(),
        FROM_NUMBER: Joi.string().required(),
        //JWT
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRES_TEMP: Joi.string().required(),
        JWT_EXPIRES_ACCESS: Joi.string().required(),
        JWT_EXPIRES_REFRESH: Joi.string().required(),
        // 회원가입 문자 인증
        VERIFY_CODE_LENGTH: Joi.number().required(),
        DAILY_VERIFY_REQUEST_LIMITS: Joi.number().required(),
        VERIFY_LIMITS: Joi.number().required(),
        VERIFY_EXPIRES_MINUTES: Joi.number().required(),
        // 구글 로그인
        GOOGLE_CLIENT_ID: Joi.string().required(),
        GOOGLE_CLIENT_SECRET: Joi.string().required(),
        GOOGLE_CALLBACK_URL: Joi.string().required(),
        // 네이버 로그인
        NAVER_CLIENT_ID: Joi.string().required(),
        NAVER_CLIENT_SECRET: Joi.string().required(),
        NAVER_CALLBACK_URL: Joi.string().required(),
        // 카카오 로그인
        KAKAO_CLIENT_ID: Joi.string().required(),
        KAKAO_CLIENT_SECRET: Joi.string().required(),
        KAKAO_CALLBACK_URL: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: configService.get<string>('DB_TYPE') as 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [
          TempUserModel,
          UserModel,
          ChurchModel,
          RequestInfoModel,
          MemberModel,
          FamilyModel,
          EducationModel,
          OfficerModel,
          MinistryModel,
          GroupModel,
          GroupRoleModel,
        ],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    ChurchesModule,
    RequestInfoModule,
    MembersModule,
    MembersSettingsModule,
    SettingsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
})
export class AppModule {}
