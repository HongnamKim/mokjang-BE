import { Module } from '@nestjs/common';
import { RequestInfoService } from './service/request-info.service';
import { RequestInfoController } from './request-info.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestInfoModel } from './entity/request-info.entity';
import { BelieverModel } from '../believers/entity/believer.entity';
import { ChurchesModule } from '../churches.module';
import { BelieversModule } from '../believers/believers.module';
import { MessagesService } from './service/messages.service';
import { RequestLimitValidatorService } from './service/request-limit-validator.service';
import { CoolSMSProvider } from './provider/coolsms.provider';

@Module({
  imports: [
    TypeOrmModule.forFeature([RequestInfoModel, BelieverModel]),
    ChurchesModule,
    BelieversModule,
  ],
  controllers: [RequestInfoController],
  providers: [
    RequestInfoService,
    MessagesService,
    RequestLimitValidatorService,
    CoolSMSProvider,
  ],
})
export class RequestInfoModule {}
