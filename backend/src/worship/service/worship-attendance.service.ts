import { Inject, Injectable } from '@nestjs/common';
import {
  IWORSHIP_ATTENDANCE_DOMAIN_SERVICE,
  IWorshipAttendanceDomainService,
} from '../worship-domain/interface/worship-attendance-domain.service.interface';
import { GetWorshipAttendancesDto } from '../dto/request/worship-attendance/get-worship-attendances.dto';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../churches/churches-domain/interface/churches-domain.service.interface';
import {
  IWORSHIP_DOMAIN_SERVICE,
  IWorshipDomainService,
} from '../worship-domain/interface/worship-domain.service.interface';
import {
  IWORSHIP_SESSION_DOMAIN_SERVICE,
  IWorshipSessionDomainService,
} from '../worship-domain/interface/worship-session-domain.service.interface';
import { WorshipAttendancePaginationResponseDto } from '../dto/response/worship-attendance/worship-attendance-pagination-response.dto';

@Injectable()
export class WorshipAttendanceService {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IWORSHIP_DOMAIN_SERVICE)
    private readonly worshipDomainService: IWorshipDomainService,
    @Inject(IWORSHIP_SESSION_DOMAIN_SERVICE)
    private readonly worshipSessionDomainService: IWorshipSessionDomainService,

    @Inject(IWORSHIP_ATTENDANCE_DOMAIN_SERVICE)
    private readonly worshipAttendanceDomainService: IWorshipAttendanceDomainService,
  ) {}

  async getAttendances(
    churchId: number,
    worshipId: number,
    sessionId: number,
    dto: GetWorshipAttendancesDto,
  ) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);

    const worship = await this.worshipDomainService.findWorshipModelById(
      church,
      worshipId,
    );

    const session =
      await this.worshipSessionDomainService.findWorshipSessionModelById(
        worship,
        sessionId,
      );

    const { data, totalCount } =
      await this.worshipAttendanceDomainService.findAttendances(session, dto);

    return new WorshipAttendancePaginationResponseDto(
      data,
      totalCount,
      data.length,
      dto.page,
      Math.ceil(totalCount / dto.take),
    );
  }
}
