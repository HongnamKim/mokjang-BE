import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IOFFICER_HISTORY_DOMAIN_SERVICE } from './service/interface/officer-history-domain.service.interface';
import { OfficerHistoryDomainService } from './service/officer-history-domain.service';
import { OfficerHistoryModel } from '../entity/officer-history.entity';
import { IMINISTRY_HISTORY_DOMAIN_SERVICE } from './service/interface/ministry-history-domain.service.interface';
import { MinistryHistoryDomainService } from './service/ministry-history-domain.service';
import { MinistryHistoryModel } from '../entity/ministry-history.entity';
import { EducationEnrollmentModel } from '../../management/educations/entity/education-enrollment.entity';
import { IEDUCATION_HISTORY_DOMAIN_SERVICE } from './service/interface/education-history-domain.service.interface';
import { EducationHistoryDomainService } from './service/education-history-domain.service';
import { GroupHistoryModel } from '../entity/group-history.entity';
import { IGROUP_HISTORY_DOMAIN_SERVICE } from './service/interface/group-history-domain.service.interface';
import { GroupHistoryDomainService } from './service/group-history-domain.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OfficerHistoryModel,
      MinistryHistoryModel,
      EducationEnrollmentModel,
      GroupHistoryModel,
    ]),
  ],
  providers: [
    {
      provide: IOFFICER_HISTORY_DOMAIN_SERVICE,
      useClass: OfficerHistoryDomainService,
    },
    {
      provide: IMINISTRY_HISTORY_DOMAIN_SERVICE,
      useClass: MinistryHistoryDomainService,
    },
    {
      provide: IEDUCATION_HISTORY_DOMAIN_SERVICE,
      useClass: EducationHistoryDomainService,
    },
    {
      provide: IGROUP_HISTORY_DOMAIN_SERVICE,
      useClass: GroupHistoryDomainService,
    },
  ],
  exports: [
    IOFFICER_HISTORY_DOMAIN_SERVICE,
    IMINISTRY_HISTORY_DOMAIN_SERVICE,
    IEDUCATION_HISTORY_DOMAIN_SERVICE,
    IGROUP_HISTORY_DOMAIN_SERVICE,
  ],
})
export class MemberHistoryDomainModule {}
