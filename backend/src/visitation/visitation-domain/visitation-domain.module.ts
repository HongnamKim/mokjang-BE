import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VisitationMetaModel } from '../entity/visitation-meta.entity';
import { VisitationDetailModel } from '../entity/visitation-detail.entity';
import { IVISITATION_META_DOMAIN_SERVICE } from './service/interface/visitation-meta-domain.service.interface';
import { VisitationMetaDomainService } from './service/visitation-meta-domain.service';
import { IVISITATION_DETAIL_DOMAIN_SERVICE } from './service/interface/visitation-detail-domain.service.interface';
import { VisitationDetailDomainService } from './service/visitation-detail-domain.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([VisitationMetaModel, VisitationDetailModel]),
  ],
  providers: [
    {
      provide: IVISITATION_META_DOMAIN_SERVICE,
      useClass: VisitationMetaDomainService,
    },
    {
      provide: IVISITATION_DETAIL_DOMAIN_SERVICE,
      useClass: VisitationDetailDomainService,
    },
  ],
  exports: [IVISITATION_DETAIL_DOMAIN_SERVICE, IVISITATION_META_DOMAIN_SERVICE],
})
export class VisitationDomainModule {}
