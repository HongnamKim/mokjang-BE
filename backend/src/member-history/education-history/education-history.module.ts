import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { MembersDomainModule } from '../../members/member-domain/members-domain.module';
import { GroupsDomainModule } from '../../management/groups/groups-domain/groups-domain.module';
import { ChurchesDomainModule } from '../../churches/churches-domain/churches-domain.module';
import { ManagerDomainModule } from '../../manager/manager-domain/manager-domain.module';
import { EducationHistoryService } from './service/education-history.service';
import { IMEMBER_FILTER_SERVICE } from '../../members/service/interface/member-filter.service.interface';
import { MemberFilterService } from '../../members/service/member-filter.service';
import { EducationHistoryController } from './controller/education-history.controller';
import { EducationHistoryDomainModule } from './education-history-domain/education-history-domain.module';

@Module({
  imports: [
    RouterModule.register([
      {
        path: 'churches/:churchId/members/:memberId/histories', // 공통 prefix
        module: EducationHistoryModule,
      },
    ]),
    MembersDomainModule,
    GroupsDomainModule,
    ChurchesDomainModule,
    ManagerDomainModule,

    EducationHistoryDomainModule,
  ],
  providers: [
    EducationHistoryService,
    {
      provide: IMEMBER_FILTER_SERVICE,
      useClass: MemberFilterService,
    },
  ],
  controllers: [EducationHistoryController],
})
export class EducationHistoryModule {}
