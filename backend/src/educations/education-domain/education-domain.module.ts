import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EducationModel } from '../education/entity/education.entity';
import { IEDUCATION_DOMAIN_SERVICE } from './interface/education-domain.service.interface';
import { EducationDomainService } from './service/education-domain.service';
import { IEDUCATION_TERM_DOMAIN_SERVICE } from './interface/education-term-domain.service.interface';
import { EducationTermDomainService } from './service/educaiton-term-domain.service';
import { EducationTermModel } from '../education-term/entity/education-term.entity';
import { IEDUCATION_ENROLLMENT_DOMAIN_SERVICE } from './interface/education-enrollment-domain.service.interface';
import { EducationEnrollmentsDomainService } from './service/education-enrollments-domain.service';
import { EducationEnrollmentModel } from '../education-enrollment/entity/education-enrollment.entity';
import { EducationSessionModel } from '../education-session/entity/education-session.entity';
import { SessionAttendanceModel } from '../session-attendance/entity/session-attendance.entity';
import { IEDUCATION_SESSION_DOMAIN_SERVICE } from './interface/education-session-domain.service.interface';
import { EducationSessionDomainService } from './service/education-session-domain.service';
import { ISESSION_ATTENDANCE_DOMAIN_SERVICE } from './interface/session-attendance-domain.service.interface';
import { SessionAttendanceDomainService } from './service/session-attendance-domain.service';

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
    {
      provide: ISESSION_ATTENDANCE_DOMAIN_SERVICE,
      useClass: SessionAttendanceDomainService,
    },
  ],
  exports: [
    IEDUCATION_DOMAIN_SERVICE,
    IEDUCATION_TERM_DOMAIN_SERVICE,
    IEDUCATION_ENROLLMENT_DOMAIN_SERVICE,
    IEDUCATION_SESSION_DOMAIN_SERVICE,
    ISESSION_ATTENDANCE_DOMAIN_SERVICE,
  ],
})
export class EducationDomainModule {}
