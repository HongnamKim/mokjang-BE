import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';
import {
  IWORSHIP_SESSION_DOMAIN_SERVICE,
  IWorshipSessionDomainService,
} from '../worship-domain/interface/worship-session-domain.service.interface';
import { CreateWorshipSessionDto } from '../dto/request/worship-session/create-worship-session.dto';
import { QueryRunner } from 'typeorm';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../churches/churches-domain/interface/churches-domain.service.interface';
import {
  IWORSHIP_DOMAIN_SERVICE,
  IWorshipDomainService,
} from '../worship-domain/interface/worship-domain.service.interface';
import { PostWorshipSessionResponseDto } from '../dto/response/worship-session/post-worship-session-response.dto';
import { GetWorshipSessionResponseDto } from '../dto/response/worship-session/get-worship-session-response.dto';
import { GetWorshipSessionsDto } from '../dto/request/worship-session/get-worship-sessions.dto';
import { WorshipSessionPaginationResponseDto } from '../dto/response/worship-session/worship-session-pagination-response.dto';
import { DeleteWorshipSessionResponseDto } from '../dto/response/worship-session/delete-worship-session.response.dto';
import { UpdateWorshipSessionDto } from '../dto/request/worship-session/update-worship-session.dto';
import { WorshipSessionException } from '../exception/worship-session.exception';
import { PatchWorshipSessionResponseDto } from '../dto/response/worship-session/patch-worship-session-response.dto';
import { WorshipModel } from '../entity/worship.entity';
import {
  IWORSHIP_ATTENDANCE_DOMAIN_SERVICE,
  IWorshipAttendanceDomainService,
} from '../worship-domain/interface/worship-attendance-domain.service.interface';
import {
  IWORSHIP_ENROLLMENT_DOMAIN_SERVICE,
  IWorshipEnrollmentDomainService,
} from '../worship-domain/interface/worship-enrollment-domain.service.interface';
import {
  IMANAGER_DOMAIN_SERVICE,
  IManagerDomainService,
} from '../../manager/manager-domain/service/interface/manager-domain.service.interface';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';
import { startOfDay, subDays } from 'date-fns';
import { TIME_ZONE } from '../../common/const/time-zone.const';

@Injectable()
export class WorshipSessionService {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IWORSHIP_DOMAIN_SERVICE)
    private readonly worshipDomainService: IWorshipDomainService,
    @Inject(IMANAGER_DOMAIN_SERVICE)
    private readonly managerDomainService: IManagerDomainService,

    @Inject(IWORSHIP_SESSION_DOMAIN_SERVICE)
    private readonly worshipSessionDomainService: IWorshipSessionDomainService,
    @Inject(IWORSHIP_ENROLLMENT_DOMAIN_SERVICE)
    private readonly worshipEnrollmentDomainService: IWorshipEnrollmentDomainService,
    @Inject(IWORSHIP_ATTENDANCE_DOMAIN_SERVICE)
    private readonly worshipAttendanceDomainService: IWorshipAttendanceDomainService,
  ) {}

  async getWorshipSessions(
    churchId: number,
    worshipId: number,
    dto: GetWorshipSessionsDto,
  ) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);
    const worship = await this.worshipDomainService.findWorshipModelById(
      church,
      worshipId,
    );

    const { data, totalCount } =
      await this.worshipSessionDomainService.findWorshipSessions(worship, dto);

    return new WorshipSessionPaginationResponseDto(
      data,
      totalCount,
      data.length,
      dto.page,
      Math.ceil(totalCount / dto.take),
    );
  }

  /**
   * 가장 최근의 예배 세션 조회 or 생성
   * @param timeZone
   * @param churchId
   * @param worshipId
   * @param qr
   */
  async getOrPostRecentSession(
    timeZone: TIME_ZONE,
    churchId: number,
    worshipId: number,
    qr: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const worship = await this.worshipDomainService.findWorshipModelById(
      church,
      worshipId,
      qr,
    );

    const recentSessionDate: Date = this.getRecentSessionDate(
      worship,
      timeZone,
    );

    const recentSession =
      await this.worshipSessionDomainService.findOrCreateRecentWorshipSession(
        worship,
        recentSessionDate,
        qr,
      );

    if (recentSession.isCreated) {
      const enrollments =
        await this.worshipEnrollmentDomainService.findAllEnrollments(
          worship,
          qr,
        );

      await this.worshipAttendanceDomainService.refreshAttendances(
        recentSession,
        enrollments,
        qr,
      );
    }

    const responseSession =
      await this.worshipSessionDomainService.findWorshipSessionById(
        worship,
        recentSession.id,
        qr,
      );

    return new GetWorshipSessionResponseDto(responseSession);
  }

  /**
   * 예배 세션 수동 생성
   * @param churchId
   * @param worshipId
   * @param sessionDate
   * @param qr
   */
  async getOrPostWorshipSessionByDate(
    churchId: number,
    worshipId: number,
    sessionDate: Date,
    qr: QueryRunner,
  ) {
    if (!sessionDate) {
      throw new BadRequestException('조회할 날짜를 입력해주세요.');
    }

    // 미래 날짜 불가능
    if (sessionDate.getTime() > Date.now() - 1) {
      throw new BadRequestException(
        WorshipSessionException.INVALID_SESSION_DATE,
      );
    }

    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const worship = await this.worshipDomainService.findWorshipModelById(
      church,
      worshipId,
      qr,
    );

    const zonedSessionDate = toZonedTime(sessionDate, TIME_ZONE.SEOUL);

    if (zonedSessionDate.getDay() !== worship.worshipDay) {
      throw new ConflictException(WorshipSessionException.INVALID_SESSION_DAY);
    }

    const session =
      await this.worshipSessionDomainService.findOrCreateWorshipSessionByDate(
        worship,
        sessionDate,
        qr,
      );

    // 예배 세션의 하위 출석 정보 생성
    if (session.isCreated) {
      const enrollments =
        await this.worshipEnrollmentDomainService.findAllEnrollments(
          worship,
          qr,
        );

      await this.worshipAttendanceDomainService.refreshAttendances(
        session,
        enrollments,
        qr,
      );
    }

    const responseSession =
      await this.worshipSessionDomainService.findWorshipSessionById(
        worship,
        session.id,
        qr,
      );

    return new PostWorshipSessionResponseDto(responseSession);
  }

  async postWorshipSessionManual(
    churchId: number,
    worshipId: number,
    dto: CreateWorshipSessionDto,
  ) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);
    const worship = await this.worshipDomainService.findWorshipModelById(
      church,
      worshipId,
    );

    const zonedSessionDate = toZonedTime(dto.sessionDateUtc, TIME_ZONE.SEOUL);

    if (zonedSessionDate.getDay() !== worship.worshipDay) {
      throw new ConflictException(WorshipSessionException.INVALID_SESSION_DAY);
    }

    const inCharge = dto.inChargeId
      ? await this.managerDomainService.findManagerByMemberId(
          church,
          dto.inChargeId,
        )
      : null;

    const newSession =
      await this.worshipSessionDomainService.createWorshipSession(
        worship,
        inCharge,
        dto,
      );

    return new PostWorshipSessionResponseDto(newSession);
  }

  /*async getSessionById(churchId: number, worshipId: number, sessionId: number) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);

    const worship = await this.worshipDomainService.findWorshipModelById(
      church,
      worshipId,
    );

    const session =
      await this.worshipSessionDomainService.findWorshipSessionById(
        worship,
        sessionId,
      );

    return new GetWorshipSessionResponseDto(session);
  }*/

  /**
   * 예배 세션 수정
   * @param churchId
   * @param worshipId
   * @param sessionId
   * @param dto
   * @param qr
   */
  async patchWorshipSessionById(
    churchId: number,
    worshipId: number,
    sessionId: number,
    dto: UpdateWorshipSessionDto,
    qr: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const worship = await this.worshipDomainService.findWorshipModelById(
      church,
      worshipId,
      qr,
    );

    const targetSession =
      await this.worshipSessionDomainService.findWorshipSessionModelById(
        worship,
        sessionId,
        qr,
      );

    const inCharge = dto.inChargeId
      ? await this.managerDomainService.findManagerByMemberId(
          church,
          dto.inChargeId,
          qr,
        )
      : null;

    await this.worshipSessionDomainService.updateWorshipSession(
      targetSession,
      inCharge,
      dto,
      qr,
    );

    const updatedSession =
      await this.worshipSessionDomainService.findWorshipSessionById(
        worship,
        targetSession.id,
        qr,
      );

    return new PatchWorshipSessionResponseDto(updatedSession);
  }

  async deleteWorshipSessionById(
    churchId: number,
    worshipId: number,
    sessionId: number,
    qr: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const worship = await this.worshipDomainService.findWorshipModelById(
      church,
      worshipId,
      qr,
    );

    const targetWorshipSession =
      await this.worshipSessionDomainService.findWorshipSessionModelById(
        worship,
        sessionId,
        qr,
      );

    await this.worshipSessionDomainService.deleteWorshipSession(
      targetWorshipSession,
      qr,
    );

    await this.worshipAttendanceDomainService.deleteAttendanceCascadeSession(
      targetWorshipSession,
      qr,
    );

    return new DeleteWorshipSessionResponseDto(
      new Date(),
      targetWorshipSession.id,
      //targetWorshipSession.title,
      true,
    );
  }

  private getRecentSessionDate(worship: WorshipModel, timeZone: TIME_ZONE) {
    const serverToday = new Date(); // UTC 로 현재 시간

    const nowInKorea = toZonedTime(serverToday, timeZone); // 현재 한국 시간
    const todayDay = nowInKorea.getDay(); // 한국 요일

    // 오늘이 예배일보다 이후(=같거나 이후)면 오늘 기준
    // 예) 오늘 화요일(2), 예배일 일요일(0) → 지난 일요일
    //     오늘 일요일(0), 예배일 일요일(0) → 오늘
    const daysToSubtract = (todayDay - worship.worshipDay + 7) % 7;

    // 예배 날짜의 00시 00분 (한국 기준)
    const recentWorshipDateInKorea = startOfDay(
      subDays(nowInKorea, daysToSubtract),
    );

    // 한국 시간 기준 예배일을 UTC Date 객체로 변환 (-9시간)
    return fromZonedTime(recentWorshipDateInKorea, timeZone);
  }
}
