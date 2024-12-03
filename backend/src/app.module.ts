import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import * as process from 'node:process';
import { ChurchesModule } from './churches/churches.module';
import { ChurchModel } from './churches/entity/church.entity';
import { RequestInfoModel } from './churches/request-info/entity/request-info.entity';
import { MemberModel } from './churches/members/entity/member.entity';
import { RequestInfoModule } from './churches/request-info/request-info.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { MembersModule } from './churches/members/members.module';
import { EducationModel } from './churches/settings/entity/education.entity';
import { OfficerModel } from './churches/settings/entity/officer.entity';
import { MinistryModel } from './churches/settings/entity/ministry.entity';
import { GroupModel } from './churches/settings/entity/group.entity';
import { SettingsModule } from './churches/settings/settings.module';
import { FamilyModel } from './churches/members/entity/family.entity';

dotenv.config();

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [
        ChurchModel,
        RequestInfoModel,
        MemberModel,
        FamilyModel,
        EducationModel,
        OfficerModel,
        MinistryModel,
        GroupModel,
      ],
      synchronize: true,
    }),
    ChurchesModule,
    RequestInfoModule,
    MembersModule,
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
