import { WorshipModel } from '../../entity/worship.entity';
import { CreateWorshipSessionDto } from '../../dto/request/worship-session/create-worship-session.dto';
import { FindOptionsRelations, QueryRunner, UpdateResult } from 'typeorm';
import { WorshipSessionModel } from '../../entity/worship-session.entity';
import { GetWorshipSessionsDto } from '../../dto/request/worship-session/get-worship-sessions.dto';
import { UpdateWorshipSessionDto } from '../../dto/request/worship-session/update-worship-session.dto';
import { ChurchUserModel } from '../../../church-user/entity/church-user.entity';
import { WorshipGroupIdsVo } from '../../vo/worship-group-ids.vo';

export const IWORSHIP_SESSION_DOMAIN_SERVICE = Symbol(
  'IWORSHIP_SESSION_DOMAIN_SERVICE',
);

export interface IWorshipSessionDomainService {
  findWorshipSessions(
    worship: WorshipModel,
    dto: GetWorshipSessionsDto,
    qr?: QueryRunner,
  ): Promise<WorshipSessionModel[]>;

  createWorshipSession(
    worship: WorshipModel,
    inCharge: ChurchUserModel | null,
    dto: CreateWorshipSessionDto,
    qr?: QueryRunner,
  ): Promise<WorshipSessionModel>;

  findOrCreateWorshipSession(
    worship: WorshipModel,
    sessionDate: Date,
    qr: QueryRunner,
  ): Promise<WorshipSessionModel & { isCreated: boolean }>;

  /*findOrCreateRecentWorshipSession(
    worship: WorshipModel,
    sessionDate: Date,
    qr: QueryRunner,
  ): Promise<WorshipSessionModel & { isCreated: boolean }>;*/

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
    worshipSession: WorshipSessionModel,
    inCharge: ChurchUserModel | null,
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
  ): Promise<number[]>;

  countByWorship(worship: WorshipModel): Promise<number>;

  findSessionCheckStatus(
    worship: WorshipModel,
    intersectionGroupIds: WorshipGroupIdsVo,
    from: Date,
    to: Date,
  ): Promise<
    { id: number; sessionDate: Date; completeAttendanceCheck: boolean }[]
  >;
}
