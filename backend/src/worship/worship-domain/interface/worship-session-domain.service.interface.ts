import { WorshipModel } from '../../entity/worship.entity';
import { CreateWorshipSessionDto } from '../../dto/request/worship-session/create-worship-session.dto';
import { FindOptionsRelations, QueryRunner, UpdateResult } from 'typeorm';
import { WorshipSessionModel } from '../../entity/worship-session.entity';
import { GetWorshipSessionsDto } from '../../dto/request/worship-session/get-worship-sessions.dto';
import { WorshipSessionDomainPaginationResultDto } from '../dto/worship-session-domain-pagination-result.dto';
import { UpdateWorshipSessionDto } from '../../dto/request/worship-session/update-worship-session.dto';

export const IWORSHIP_SESSION_DOMAIN_SERVICE = Symbol(
  'IWORSHIP_SESSION_DOMAIN_SERVICE',
);

export interface IWorshipSessionDomainService {
  findWorshipSessions(
    worship: WorshipModel,
    dto: GetWorshipSessionsDto,
    qr?: QueryRunner,
  ): Promise<WorshipSessionDomainPaginationResultDto>;

  createWorshipSession(
    worship: WorshipModel,
    dto: CreateWorshipSessionDto,
    qr: QueryRunner,
  ): Promise<WorshipSessionModel>;

  findOrCreateRecentWorshipSession(
    worship: WorshipModel,
    dto: CreateWorshipSessionDto,
    qr: QueryRunner,
  ): Promise<WorshipSessionModel>;

  findWorshipSessionById(
    worship: WorshipModel,
    sessionId: number,
    qr?: QueryRunner,
  ): Promise<WorshipSessionModel>;

  findWorshipSessionModelById(
    worship: WorshipModel,
    sessionId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<WorshipSessionModel>,
  ): Promise<WorshipSessionModel>;

  updateWorshipSession(
    worship: WorshipModel,
    worshipSession: WorshipSessionModel,
    dto: UpdateWorshipSessionDto,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  deleteWorshipSession(
    worshipSession: WorshipSessionModel,
    qr?: QueryRunner,
  ): Promise<UpdateResult>;

  deleteWorshipSessionCascade(
    worship: WorshipModel,
    qr: QueryRunner,
  ): Promise<UpdateResult>;
}
