import { Module } from '@nestjs/common';
import { RequestInfoService } from './service/request-info.service';
import { RequestInfoController } from './request-info.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestInfoModel } from './entity/request-info.entity';
import { MemberModel } from '../members/entity/member.entity';
import { MembersModule } from '../members/members.module';
import { RequestLimitValidatorService } from './service/request-limit-validator.service';
import { CommonModule } from '../../common/common.module';
import { ChurchesDomainModule } from '../churches-domain/churches-domain.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RequestInfoModel, MemberModel]),
    ChurchesDomainModule,
    MembersModule,
    CommonModule,
  ],
  controllers: [RequestInfoController],
  providers: [
    RequestInfoService,
    //MessagesService,
    RequestLimitValidatorService,
    //CoolSMSProvider,
  ],
})
export class RequestInfoModule {}
