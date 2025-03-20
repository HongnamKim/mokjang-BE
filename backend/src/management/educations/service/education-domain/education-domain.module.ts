import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EducationModel } from '../../../entity/education/education.entity';
import { IEDUCATION_DOMAIN_SERVICE } from './interface/education-domain.service.interface';
import { EducationDomainService } from './service/education-domain.service';
import { IEDUCATION_TERM_DOMAIN_SERVICE } from './interface/education-term-domain.service.interface';
import { EducationTermDomainService } from './service/educaiton-term-domain.service';
import { EducationTermModel } from '../../../entity/education/education-term.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EducationModel, EducationTermModel])],
  providers: [
    {
      provide: IEDUCATION_DOMAIN_SERVICE,
      useClass: EducationDomainService,
    },
    {
      provide: IEDUCATION_TERM_DOMAIN_SERVICE,
      useClass: EducationTermDomainService,
    },
  ],
  exports: [IEDUCATION_DOMAIN_SERVICE, IEDUCATION_TERM_DOMAIN_SERVICE],
})
export class EducationDomainModule {}
