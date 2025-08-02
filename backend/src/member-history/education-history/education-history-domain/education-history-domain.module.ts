import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IEDUCATION_HISTORY_DOMAIN_SERVICE } from './interface/education-history-domain.service.interface';
import { EducationHistoryDomainService } from './service/education-history-domain.service';
import { EducationEnrollmentModel } from '../../../educations/entity/education-enrollment.entity';

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
