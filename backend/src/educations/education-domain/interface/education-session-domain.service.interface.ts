import { EducationTermModel } from '../../education-term/entity/education-term.entity';
import { FindOptionsRelations, QueryRunner, UpdateResult } from 'typeorm';
import { EducationSessionModel } from '../../education-session/entity/education-session.entity';
import { UpdateEducationSessionDto } from '../../education-session/dto/request/update-education-session.dto';
import { CreateEducationSessionDto } from '../../education-session/dto/request/create-education-session.dto';
import { GetEducationSessionDto } from '../../education-session/dto/request/get-education-session.dto';
import { ChurchModel } from '../../../churches/entity/church.entity';
import { GetEducationSessionForCalendarDto } from '../../../calendar/dto/request/education/get-education-session-for-calendar.dto';
import { ChurchUserModel } from '../../../church-user/entity/church-user.entity';
import { MemberModel } from '../../../members/entity/member.entity';

export const IEDUCATION_SESSION_DOMAIN_SERVICE = Symbol(
  'IEDUCATION_SESSION_DOMAIN_SERVICE',
);

export interface IEducationSessionDomainService {
  findEducationSessionsForCalendar(
    church: ChurchModel,
    dto: GetEducationSessionForCalendarDto,
    qr?: QueryRunner,
  ): Promise<EducationSessionModel[]>;

  findEducationSessionByIdForCalendar(
    church: ChurchModel,
    sessionId: number,
  ): Promise<EducationSessionModel>;

  findEducationSessionIds(
    educationTerm: EducationTermModel,
    qr: QueryRunner,
  ): Promise<EducationSessionModel[]>;

  findEducationSessions(
    educationTerm: EducationTermModel,
    dto: GetEducationSessionDto,
    qr?: QueryRunner,
  ): Promise<EducationSessionModel[]>;

  findEducationSessionModelById(
    educationTerm: EducationTermModel,
    educationSessionId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<EducationSessionModel>,
  ): Promise<EducationSessionModel>;

  findEducationSessionById(
    educationTerm: EducationTermModel,
    educationSessionId: number,
    qr?: QueryRunner,
  ): Promise<EducationSessionModel>;

  createEducationSessions(
    educationTerm: EducationTermModel,
    numberOfSessions: number,
    qr: QueryRunner,
  ): Promise<EducationSessionModel[]>;

  createAdditionalSessions(
    educationTerm: EducationTermModel,
    numberOfSessions: number,
    qr: QueryRunner,
  ): Promise<EducationSessionModel[]>;

  createEducationSession(
    educationTerm: EducationTermModel,
    creatorMember: ChurchUserModel,
    dto: CreateEducationSessionDto,
    inCharge: ChurchUserModel | null,
    qr: QueryRunner,
  ): Promise<EducationSessionModel>;

  updateEducationSession(
    educationSession: EducationSessionModel,
    dto: UpdateEducationSessionDto,
    inCharge: ChurchUserModel | null, //MemberModel | null,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  deleteEducationSession(
    educationSession: EducationSessionModel,
    qr: QueryRunner,
  ): Promise<void>;

  deleteEducationSessionCascade(
    educationTerm: EducationTermModel,
    qr: QueryRunner,
  ): Promise<string>;

  reorderSessionsAfterDeletion(
    educationTerm: EducationTermModel,
    deletedSession: EducationSessionModel,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  findMyEducationSessions(
    inCharge: MemberModel,
    from: Date,
    to: Date,
  ): Promise<EducationSessionModel[]>;
}
