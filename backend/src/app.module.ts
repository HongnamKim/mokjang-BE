import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import * as process from 'node:process';
import { ChurchesModule } from './churches/churches.module';
import { ChurchModel } from './churches/entity/church.entity';
import { InvitationModel } from './churches/invitation/entity/invitation.entity';
import { BelieverModel } from './churches/believers/entity/believer.entity';
import { InvitationModule } from './churches/invitation/invitation.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { BelieversModule } from './churches/believers/believers.module';

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
      entities: [ChurchModel, InvitationModel, BelieverModel],
      synchronize: true,
    }),
    ChurchesModule,
    InvitationModule,
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
