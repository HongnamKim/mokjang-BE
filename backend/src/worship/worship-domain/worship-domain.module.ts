import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IWORSHIP_DOMAIN_SERVICE } from './interface/worship-domain.service.interface';
import { WorshipDomainService } from './service/worship-domain.service';
import { IWORSHIP_ATTENDANCE_DOMAIN_SERVICE } from './interface/worship-attendance-domain.service.interface';
import { WorshipAttendanceDomainService } from './service/worship-attendance-domain.service';
import { IWORSHIP_ENROLLMENT_DOMAIN_SERVICE } from './interface/worship-enrollment-domain.service.interface';
import { WorshipEnrollmentDomainService } from './service/worship-enrollment-domain.service';
import { IWORSHIP_SESSION_DOMAIN_SERVICE } from './interface/worship-session-domain.service.interface';
import { WorshipSessionDomainService } from './service/worship-session-domain.service';
import { WorshipModel } from '../entity/worship.entity';
import { WorshipEnrollmentModel } from '../entity/worship-enrollment.entity';
import { WorshipSessionModel } from '../entity/worship-session.entity';
import { WorshipAttendanceModel } from '../entity/worship-attendance.entity';
import { WorshipTargetGroupModel } from '../entity/worship-target-group.entity';
import { IWORSHIP_TARGET_GROUP_DOMAIN_SERVICE } from './interface/worship-target-group-domain.service.interface';
import { WorshipTargetGroupDomainService } from './service/worship-target-group-domain.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WorshipModel,
      WorshipEnrollmentModel,
      WorshipSessionModel,
      WorshipAttendanceModel,
      WorshipTargetGroupModel,
    ]),
  ],
  providers: [
    { provide: IWORSHIP_DOMAIN_SERVICE, useClass: WorshipDomainService },
    {
      provide: IWORSHIP_ATTENDANCE_DOMAIN_SERVICE,
      useClass: WorshipAttendanceDomainService,
    },
    {
      provide: IWORSHIP_ENROLLMENT_DOMAIN_SERVICE,
      useClass: WorshipEnrollmentDomainService,
    },
    {
      provide: IWORSHIP_SESSION_DOMAIN_SERVICE,
      useClass: WorshipSessionDomainService,
    },
    {
      provide: IWORSHIP_TARGET_GROUP_DOMAIN_SERVICE,
      useClass: WorshipTargetGroupDomainService,
    },
  ],
  exports: [
    IWORSHIP_DOMAIN_SERVICE,
    IWORSHIP_ATTENDANCE_DOMAIN_SERVICE,
    IWORSHIP_ENROLLMENT_DOMAIN_SERVICE,
    IWORSHIP_SESSION_DOMAIN_SERVICE,
    IWORSHIP_TARGET_GROUP_DOMAIN_SERVICE,
  ],
})
export class WorshipDomainModule {}
