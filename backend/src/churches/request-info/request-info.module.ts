import { Module } from '@nestjs/common';
import { RequestInfoService } from './service/request-info.service';
import { RequestInfoController } from './request-info.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestInfoModel } from './entity/request-info.entity';
import { RequestLimitValidatorService } from './service/request-limit-validator.service';
import { CommonModule } from '../../common/common.module';
import { ChurchesDomainModule } from '../churches-domain/churches-domain.module';
import { MembersDomainModule } from '../../members/member-domain/members-domain.module';
import { FamilyRelationDomainModule } from '../../family-relation/family-relation-domain/family-relation-domain.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RequestInfoModel]),
    CommonModule,
    ChurchesDomainModule,
    MembersDomainModule,
    FamilyRelationDomainModule,
  ],
  controllers: [RequestInfoController],
  providers: [RequestInfoService, RequestLimitValidatorService],
})
export class RequestInfoModule {}
