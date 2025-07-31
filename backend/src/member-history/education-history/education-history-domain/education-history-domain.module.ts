import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EducationEnrollmentModel } from '../../../management/educations/entity/education-enrollment.entity';
import { IEDUCATION_HISTORY_DOMAIN_SERVICE } from './interface/education-history-domain.service.interface';
import { EducationHistoryDomainService } from './service/education-history-domain.service';

@Module({
  imports: [TypeOrmModule.forFeature([EducationEnrollmentModel])],
  providers: [
    {
      provide: IEDUCATION_HISTORY_DOMAIN_SERVICE,
      useClass: EducationHistoryDomainService,
    },
  ],
  exports: [IEDUCATION_HISTORY_DOMAIN_SERVICE],
})
export class EducationHistoryDomainModule {}
