import { Module } from '@nestjs/common';
import { RequestInfoService } from './service/request-info.service';
import { RequestInfoController } from './request-info.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestInfoModel } from './entity/request-info.entity';
import { MemberModel } from '../members/entity/member.entity';
import { ChurchesModule } from '../churches.module';
import { MembersModule } from '../members/members.module';
import { MessagesService } from './service/messages.service';
import { RequestLimitValidatorService } from './service/request-limit-validator.service';
import { CoolSMSProvider } from './provider/coolsms.provider';

@Module({
  imports: [
    TypeOrmModule.forFeature([RequestInfoModel, MemberModel]),
    ChurchesModule,
    MembersModule,
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
