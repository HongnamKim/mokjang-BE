import { ConflictException, Inject, Injectable } from '@nestjs/common';
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

@Injectable()
export class WorshipSessionService {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IWORSHIP_DOMAIN_SERVICE)
    private readonly worshipDomainService: IWorshipDomainService,

    @Inject(IWORSHIP_SESSION_DOMAIN_SERVICE)
    private readonly worshipSessionDomainService: IWorshipSessionDomainService,
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

  async postWorshipSession(
    churchId: number,
    worshipId: number,
    dto: CreateWorshipSessionDto,
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

    if (dto.sessionDate.getDay() !== worship.worshipDay) {
      throw new ConflictException(WorshipSessionException.INVALID_SESSION_DAY);
    }

    const newSession =
      await this.worshipSessionDomainService.createWorshipSession(
        worship,
        dto,
        qr,
      );

    const session =
      await this.worshipSessionDomainService.findWorshipSessionById(
        worship,
        newSession.id,
        qr,
      );

    return new PostWorshipSessionResponseDto(session);
  }

  async getSessionById(churchId: number, worshipId: number, sessionId: number) {
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
  }

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

    if (dto.sessionDate) {
      if (dto.sessionDate.getDay() !== worship.worshipDay) {
        throw new ConflictException(
          WorshipSessionException.INVALID_SESSION_DAY,
        );
      }
    }

    await this.worshipSessionDomainService.updateWorshipSession(
      worship,
      targetSession,
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
    qr?: QueryRunner,
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

    return new DeleteWorshipSessionResponseDto(
      new Date(),
      targetWorshipSession.id,
      targetWorshipSession.title,
      true,
    );
  }

  async getOrPostRecentSession(
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

    const recentSessionDate: Date = this.getRecentSessionDate(worship);

    const dto: CreateWorshipSessionDto = {
      title: `${recentSessionDate.getFullYear()}-${recentSessionDate.getMonth() + 1}-${recentSessionDate.getDate()} ${worship.title}`,
      description: '',
      sessionDate: recentSessionDate,
    };

    const recentSession =
      await this.worshipSessionDomainService.findOrCreateRecentWorshipSession(
        worship,
        dto,
        qr,
      );

    return new GetWorshipSessionResponseDto(recentSession);
  }

  private getRecentSessionDate(worship: WorshipModel) {
    const today = new Date(new Date().setHours(0, 0, 0, 0));
    let recentSessionDate: Date;

    if (worship.worshipDay < today.getDay()) {
      recentSessionDate = new Date(
        today.getTime() -
          (today.getDay() - worship.worshipDay) * 24 * 60 * 60 * 1000,
      );
    } else {
      recentSessionDate = new Date(
        today.getTime() -
          (7 - (worship.worshipDay - today.getDay())) * 24 * 60 * 60 * 1000,
      );
    }

    return recentSessionDate;
  }
}
