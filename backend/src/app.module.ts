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

import { OfficerModel } from './management/officers/entity/officer.entity';
import { MinistryModel } from './management/ministries/entity/ministry.entity';
import { MinistryGroupModel } from './management/ministries/entity/ministry-group.entity';
import { GroupModel } from './management/groups/entity/group.entity';
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
import { OfficerHistoryModel } from './member-history/officer-history/entity/officer-history.entity';
import { MinistryHistoryModel } from './member-history/ministry-history/entity/child/ministry-history.entity';
import { GroupHistoryModel } from './member-history/group-history/entity/group-history.entity';
import { MemberHistoryModule } from './member-history/member-history.module';
import { VisitationModule } from './visitation/visitation.module';
import { VisitationMetaModel } from './visitation/entity/visitation-meta.entity';
import { VisitationDetailModel } from './visitation/entity/visitation-detail.entity';
import { ReportModule } from './report/report.module';
import { ReportModel } from './report/base-report/entity/report.entity';
import { VisitationReportModel } from './report/visitation-report/entity/visitation-report.entity';
import { ChurchJoinModel } from './church-join/entity/church-join.entity';
import { ChurchJoinStatModel } from './church-join/entity/church-join-stat.entity';
import { TaskModule } from './task/task.module';
import { TaskModel } from './task/entity/task.entity';
import { TaskReportModel } from './report/task-report/entity/task-report.entity';
import { EducationReportModel } from './report/education-report/entity/education-report.entity';
import { PermissionModule } from './permission/permission.module';
import { PermissionUnitModel } from './permission/entity/permission-unit.entity';
import { PermissionDomainModule } from './permission/permission-domain/permission-domain.module';
import { PermissionTemplateModel } from './permission/entity/permission-template.entity';
import { ManagerModule } from './manager/manager.module';
import { ChurchUserModule } from './church-user/church-user.module';
import { ChurchUserModel } from './church-user/entity/church-user.entity';
import { PermissionScopeModel } from './permission/entity/permission-scope.entity';
import { ChurchJoinModule } from './church-join/church-join.module';
import { WorshipModel } from './worship/entity/worship.entity';
import { WorshipEnrollmentModel } from './worship/entity/worship-enrollment.entity';
import { WorshipSessionModel } from './worship/entity/worship-session.entity';
import { WorshipAttendanceModel } from './worship/entity/worship-attendance.entity';
import { WorshipModule } from './worship/worship.module';
import { WorshipTargetGroupModel } from './worship/entity/worship-target-group.entity';
import { CalendarModule } from './calendar/calendar.module';
import { ChurchEventModel } from './calendar/entity/church-event.entity';
import { MyPageModule } from './my-page/my-page.module';
import { HomeModule } from './home/home.module';
import { MinistryGroupHistoryModel } from './member-history/ministry-history/entity/ministry-group-history.entity';
import { MinistryGroupRoleHistoryModel } from './member-history/ministry-history/entity/child/ministry-group-role-history.entity';
import { GroupDetailHistoryModel } from './member-history/group-history/entity/group-detail-history.entity';
import { MinistryGroupDetailHistoryModel } from './member-history/ministry-history/entity/ministry-group-detail-history.entity';
import { EducationsModule } from './educations/educations.module';
import { EducationModel } from './educations/education/entity/education.entity';
import { EducationTermModel } from './educations/education-term/entity/education-term.entity';
import { EducationSessionModel } from './educations/education-session/entity/education-session.entity';
import { SessionAttendanceModel } from './educations/session-attendance/entity/session-attendance.entity';
import { EducationEnrollmentModel } from './educations/education-enrollment/entity/education-enrollment.entity';
//import { EducationTermReportModel } from './report/education-report/entity/education-term-report.entity';

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
        url: configService.get<string>('DB_HOST') as string,
        //host: configService.get<string>('DB_HOST'),
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
          // 교회 가입 엔티티
          ChurchUserModel,
          ChurchJoinModel,
          ChurchJoinStatModel,
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
          // 직분 관련 엔티티
          OfficerModel,
          OfficerHistoryModel,
          // 사역 관련 엔티티
          MinistryModel,
          MinistryGroupModel,
          MinistryGroupHistoryModel,
          MinistryGroupDetailHistoryModel,
          MinistryGroupRoleHistoryModel,
          MinistryHistoryModel,
          // 그룹 관련 엔티티
          GroupModel,
          GroupHistoryModel,
          GroupDetailHistoryModel,
          // 심방 관련 엔티티
          VisitationMetaModel,
          VisitationDetailModel,
          // 보고 관련 엔티티
          ReportModel,
          VisitationReportModel,
          TaskReportModel,
          EducationReportModel,
          //EducationTermReportModel,
          // 업무 관련 엔티티
          TaskModel,
          // 권한 관련
          PermissionUnitModel,
          PermissionTemplateModel,
          PermissionScopeModel,
          // 예배, 출석 관련
          WorshipModel,
          WorshipEnrollmentModel,
          WorshipSessionModel,
          WorshipAttendanceModel,
          WorshipTargetGroupModel,
          // 교회 일정표/이벤트
          ChurchEventModel,
        ],
        synchronize: false,
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
    AuthModule,
    MyPageModule,
    ReportModule,
    UserModule,
    ChurchesModule,
    ChurchJoinModule,
    ChurchUserModule,
    ManagerModule,
    PermissionModule,
    RequestInfoModule,
    MembersModule,
    FamilyRelationModule,
    MemberHistoryModule,
    ManagementModule,
    EducationsModule,
    VisitationModule,
    TaskModule,
    WorshipModule,
    CalendarModule,
    HomeModule,

    ChurchesDomainModule,
    MembersDomainModule,
    PermissionDomainModule,
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
