import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EducationModel } from '../../../entity/education/education.entity';
import { IEDUCATION_DOMAIN_SERVICE } from './interface/education-domain.service.interface';
import { EducationDomainService } from './service/education-domain.service';
import { IEDUCATION_TERM_DOMAIN_SERVICE } from './interface/education-term-domain.service.interface';
import { EducationTermDomainService } from './service/educaiton-term-domain.service';
import { EducationTermModel } from '../../../entity/education/education-term.entity';
import { IEDUCATION_ENROLLMENT_DOMAIN_SERVICE } from './interface/education-enrollment-domain.service.interface';
import { EducationEnrollmentsDomainService } from './service/education-enrollments-domain.service';
import { EducationEnrollmentModel } from '../../../entity/education/education-enrollment.entity';
import { EducationSessionModel } from '../../../entity/education/education-session.entity';
import { SessionAttendanceModel } from '../../../entity/education/session-attendance.entity';
import { IEDUCATION_SESSION_DOMAIN_SERVICE } from './interface/education-session-domain.service.interface';
import { EducationSessionDomainService } from './service/education-session-domain.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EducationModel,
      EducationTermModel,
      EducationEnrollmentModel,
      EducationSessionModel,
      SessionAttendanceModel,
    ]),
  ],
  providers: [
    {
      provide: IEDUCATION_DOMAIN_SERVICE,
      useClass: EducationDomainService,
    },
    {
      provide: IEDUCATION_TERM_DOMAIN_SERVICE,
      useClass: EducationTermDomainService,
    },
    {
      provide: IEDUCATION_ENROLLMENT_DOMAIN_SERVICE,
      useClass: EducationEnrollmentsDomainService,
    },
    {
      provide: IEDUCATION_SESSION_DOMAIN_SERVICE,
      useClass: EducationSessionDomainService,
    },
  ],
  exports: [
    IEDUCATION_DOMAIN_SERVICE,
    IEDUCATION_TERM_DOMAIN_SERVICE,
    IEDUCATION_ENROLLMENT_DOMAIN_SERVICE,
    IEDUCATION_SESSION_DOMAIN_SERVICE,
  ],
})
export class EducationDomainModule {}
