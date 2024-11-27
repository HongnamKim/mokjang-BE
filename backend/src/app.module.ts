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
import { BelieverModel } from './churches/believers/entity/believer.entity';
import { RequestInfoModule } from './churches/request-info/request-info.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { BelieversModule } from './churches/believers/believers.module';
import { EducationModel } from './churches/entity/education.entity';
import { PositionModel } from './churches/entity/position.entity';
import { MinistryModel } from './churches/entity/ministry.entity';
import { GroupModel } from './churches/entity/group.entity';

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
        BelieverModel,
        EducationModel,
        PositionModel,
        MinistryModel,
        GroupModel,
      ],
      synchronize: true,
    }),
    ChurchesModule,
    RequestInfoModule,
    BelieversModule,
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
