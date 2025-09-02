import { Module } from '@nestjs/common';
import { ChurchesService } from './service/churches.service';
import { ChurchesController } from './controller/churches.controller';
import { UserDomainModule } from '../user/user-domain/user-domain.module';
import { ChurchesDomainModule } from './churches-domain/churches-domain.module';
import { MembersDomainModule } from '../members/member-domain/members-domain.module';
import { ChurchUserDomainModule } from '../church-user/church-user-domain/church-user-domain.module';
import { ManagerDomainModule } from '../manager/manager-domain/manager-domain.module';
import { SubscriptionDomainModule } from '../subscription/subscription-domain/subscription-domain.module';
import { DummyDataDomainModule } from '../dummy-data/dummy-data-domain/dummy-data-domain.module';
import { OfficerHistoryDomainModule } from '../member-history/officer-history/officer-history-domain/officer-history-domain.module';
import { GroupHistoryDomainModule } from '../member-history/group-history/group-history-domain/group-history-domain.module';
import { TrialChurchesService } from './service/trial-churches.service';

@Module({
  imports: [
    UserDomainModule,
    ChurchesDomainModule,
    ManagerDomainModule,
    MembersDomainModule,
    ChurchUserDomainModule,
    SubscriptionDomainModule,

    DummyDataDomainModule,
    OfficerHistoryDomainModule,
    GroupHistoryDomainModule,
  ],
  controllers: [ChurchesController],
  providers: [ChurchesService, TrialChurchesService],
})
export class ChurchesModule {}
