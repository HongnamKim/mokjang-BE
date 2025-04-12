import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChurchModel } from './churches/entity/church.entity';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import * as Joi from 'joi';
import { TempUserModel } from './auth/entity/temp-user.entity';
import { UserModel } from './user/entity/user.entity';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { DummyDataService } from './dummy-data.service';
import { UserModule } from './user/user.module';
import { ChurchesModule } from './churches/churches.module';
import { EducationModel } from './management/educations/entity/education.entity';
import { EducationTermModel } from './management/educations/entity/education-term.entity';
import { EducationSessionModel } from './management/educations/entity/education-session.entity';
import { SessionAttendanceModel } from './management/educations/entity/session-attendance.entity';
import { EducationEnrollmentModel } from './management/educations/entity/education-enrollment.entity';
import { OfficerModel } from './management/officers/entity/officer.entity';
import { MinistryModel } from './management/ministries/entity/ministry.entity';
import { MinistryGroupModel } from './management/ministries/entity/ministry-group.entity';
import { GroupModel } from './management/groups/entity/group.entity';
import { GroupRoleModel } from './management/groups/entity/group-role.entity';
import { ManagementModule } from './management/management.module';
import { MemberModel } from './members/entity/member.entity';
import { FamilyRelationModel } from './family-relation/entity/family-relation.entity';
import { MembersModule } from './members/members.module';
import { MembersDomainModule } from './members/member-domain/members-domain.module';
import { ChurchesDomainModule } from './churches/churches-domain/churches-domain.module';
import { FamilyRelationModule } from './family-relation/family-relation.module';
import { JwtModule } from '@nestjs/jwt';
import { ENV_VARIABLE_KEY } from './common/const/env.const';
import { RequestInfoModel } from './request-info/entity/request-info.entity';
import { RequestInfoModule } from './request-info/request-info.module';
import { OfficerHistoryModel } from './member-history/entity/officer-history.entity';
import { MinistryHistoryModel } from './member-history/entity/ministry-history.entity';
import { GroupHistoryModel } from './member-history/entity/group-history.entity';
import { MemberHistoryModule } from './member-history/member-history.module';
import { VisitationModule } from './visitation/visitation.module';
import { VisitationMetaModel } from './visitation/entity/visitation-meta.entity';
import { VisitationDetailModel } from './visitation/entity/visitation-detail.entity';
import { ReportModule } from './report/report.module';
import { ReportModel } from './report/entity/base-report.entity';
import { VisitationReportModel } from './report/entity/visitation-report.entity';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        // 배포환경
        NODE_ENV: Joi.string().required(),
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
        CLIENT_HOST: Joi.string().required(),
        CLIENT_PORT: Joi.number().required(),
        // 메시지 API
        SMS_API_KEY: Joi.string().required(),
        SMS_API_SECRET: Joi.string().required(),
        FROM_NUMBER: Joi.string().required(),
        BETA_TEST_TO_NUMBER: Joi.string().required(),
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
        //url: configService.get<string>('DB_HOST') as string,
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [
          // 유저 관련 엔티티
          TempUserModel,
          UserModel,
          // 교회 관련 엔티티
          ChurchModel,
          // 교인 관련 엔티티
          RequestInfoModel,
          MemberModel,
          FamilyRelationModel,
          // 교육 관련 엔티티
          EducationModel,
          EducationTermModel,
          EducationSessionModel,
          SessionAttendanceModel,
          EducationEnrollmentModel,
          //EducationHistoryModel,
          // 직분 관련 엔티티
          OfficerModel,
          OfficerHistoryModel,
          // 사역 관련 엔티티
          MinistryModel,
          MinistryGroupModel,
          MinistryHistoryModel,
          // 그룹 관련 엔티티
          GroupModel,
          GroupRoleModel,
          GroupHistoryModel,
          // 심방 관련 엔티티
          VisitationMetaModel,
          VisitationDetailModel,
          // 업무 보고 관련 엔티티
          ReportModel,
          VisitationReportModel,
        ],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    JwtModule.registerAsync({
      global: true,
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow(ENV_VARIABLE_KEY.JWT_SECRET),
      }),
      inject: [ConfigService],
    }),
    //CommonModule,
    AuthModule,
    UserModule,
    ChurchesModule,
    RequestInfoModule,
    MembersModule,
    ReportModule,
    FamilyRelationModule,
    MemberHistoryModule,
    ManagementModule,
    VisitationModule,

    ChurchesDomainModule,
    MembersDomainModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
    DummyDataService,
  ],
})
export class AppModule {}
