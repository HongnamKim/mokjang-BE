import { Inject, Injectable } from '@nestjs/common';

import { GetEducationSessionForCalendarDto } from '../dto/request/education/get-education-session-for-calendar.dto';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../churches/churches-domain/interface/churches-domain.service.interface';
import {
  IEDUCATION_SESSION_DOMAIN_SERVICE,
  IEducationSessionDomainService,
} from '../../educations/education-domain/interface/education-session-domain.service.interface';

@Injectable()
export class CalendarEducationService {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,

    @Inject(IEDUCATION_SESSION_DOMAIN_SERVICE)
    private readonly educationSessionDomainService: IEducationSessionDomainService,
  ) {}

  async getEducationSessionsForCalendar(
    churchId: number,
    dto: GetEducationSessionForCalendarDto,
  ) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);

    return this.educationSessionDomainService.findEducationSessionsForCalendar(
      church,
      dto,
    );
  }

  async getEducationSessionById(churchId: number, educationSessionId: number) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);

    const educationSession =
      await this.educationSessionDomainService.findEducationSessionByIdForCalendar(
        church,
        educationSessionId,
      );

    return educationSession;
  }
}
