import { Inject, Injectable } from '@nestjs/common';

import { GetEducationSessionForCalendarDto } from '../dto/request/education/get-education-session-for-calendar.dto';
import {
  IEDUCATION_SESSION_DOMAIN_SERVICE,
  IEducationSessionDomainService,
} from '../../educations/education-domain/interface/education-session-domain.service.interface';
import { ChurchModel } from '../../churches/entity/church.entity';

@Injectable()
export class CalendarEducationService {
  constructor(
    @Inject(IEDUCATION_SESSION_DOMAIN_SERVICE)
    private readonly educationSessionDomainService: IEducationSessionDomainService,
  ) {}

  async getEducationSessionsForCalendar(
    church: ChurchModel,
    dto: GetEducationSessionForCalendarDto,
  ) {
    return this.educationSessionDomainService.findEducationSessionsForCalendar(
      church,
      dto,
    );
  }

  async getEducationSessionById(
    church: ChurchModel,
    educationSessionId: number,
  ) {
    return this.educationSessionDomainService.findEducationSessionByIdForCalendar(
      church,
      educationSessionId,
    );
  }
}
