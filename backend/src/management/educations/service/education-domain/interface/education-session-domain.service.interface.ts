import { EducationTermModel } from '../../../entity/education-term.entity';
import { QueryRunner, UpdateResult } from 'typeorm';
import { EducationSessionModel } from '../../../entity/education-session.entity';
import { UpdateEducationSessionDto } from '../../../dto/sessions/update-education-session.dto';

export const IEDUCATION_SESSION_DOMAIN_SERVICE = Symbol(
  'IEDUCATION_SESSION_DOMAIN_SERVICE',
);

export interface IEducationSessionDomainService {
  findEducationSessions(
    educationTerm: EducationTermModel,
    qr?: QueryRunner,
  ): Promise<EducationSessionModel[]>;

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

  createSingleEducationSession(
    educationTerm: EducationTermModel,
    qr: QueryRunner,
  ): Promise<EducationSessionModel>;

  updateEducationSession(
    educationSession: EducationSessionModel,
    dto: UpdateEducationSessionDto,
    qr: QueryRunner,
  ): Promise<EducationSessionModel>;

  deleteEducationSession(
    educationSession: EducationSessionModel,
    qr: QueryRunner,
  ): Promise<string>;

  deleteEducationSessionCasCade(
    educationTerm: EducationTermModel,
    qr: QueryRunner,
  ): Promise<string>;

  reorderSessionsAfterDeletion(
    educationTerm: EducationTermModel,
    deletedSession: EducationSessionModel,
    qr: QueryRunner,
  ): Promise<UpdateResult>;
}
