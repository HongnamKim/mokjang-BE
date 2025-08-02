import { EducationModel } from '../../education/entity/education.entity';
import { GetEducationTermDto } from '../../education-term/dto/request/get-education-term.dto';
import {
  FindOptionsRelations,
  FindOptionsSelect,
  QueryRunner,
  UpdateResult,
} from 'typeorm';
import { EducationTermModel } from '../../education-term/entity/education-term.entity';
import { CreateEducationTermDto } from '../../education-term/dto/request/create-education-term.dto';
import { UpdateEducationTermDto } from '../../education-term/dto/request/update-education-term.dto';
import { GetInProgressEducationTermDto } from '../../education-term/dto/request/get-in-progress-education-term.dto';
import { ChurchModel } from '../../../churches/entity/church.entity';
import { ChurchUserModel } from '../../../church-user/entity/church-user.entity';
import { EducationEnrollmentStatus } from '../../education-enrollment/const/education-enrollment-status.enum';

export const IEDUCATION_TERM_DOMAIN_SERVICE = Symbol(
  'IEDUCATION_TERM_DOMAIN_SERVICE',
);

export interface IEducationTermDomainService {
  findEducationTerms(
    education: EducationModel,
    dto: GetEducationTermDto,
    qr?: QueryRunner,
  ): Promise<EducationTermModel[]>;

  findEducationTermById(
    education: EducationModel,
    educationTermId: number,
    qr?: QueryRunner,
  ): Promise<EducationTermModel>;

  findEducationTermModelById(
    education: EducationModel,
    educationTermId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<EducationTermModel>,
    selectOptions?: FindOptionsSelect<EducationTermModel>,
  ): Promise<EducationTermModel>;

  createEducationTerm(
    education: EducationModel,
    creator: ChurchUserModel, //MemberModel,
    instructor: ChurchUserModel | null, //MemberModel | null,
    dto: CreateEducationTermDto,
    qr: QueryRunner,
  ): Promise<EducationTermModel>;

  updateEducationTerm(
    education: EducationModel,
    educationTerm: EducationTermModel,
    newInstructor: ChurchUserModel | null, //MemberModel | null,
    dto: UpdateEducationTermDto,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  deleteEducationTerm(
    educationTerm: EducationTermModel,
    qr?: QueryRunner,
  ): Promise<void>;

  updateEducationTermName(
    education: EducationModel,
    educationName: string,
    qr: QueryRunner,
  ): Promise<void>;

  incrementEnrollmentCount(
    educationTerm: EducationTermModel,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  decrementEnrollmentCount(
    educationTerm: EducationTermModel,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  incrementEducationStatusCount(
    educationTerm: EducationTermModel,
    status: EducationEnrollmentStatus,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  decrementEducationStatusCount(
    educationTerm: EducationTermModel,
    status: EducationEnrollmentStatus,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  incrementNumberOfSessions(
    educationTerm: EducationTermModel,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  decrementNumberOfSessions(
    educationTerm: EducationTermModel,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  incrementCompletedSessionsCount(
    educationTerm: EducationTermModel,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  decrementCompletedSessionsCount(
    educationTerm: EducationTermModel,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  findInProgressEducationTerms(
    church: ChurchModel,
    dto: GetInProgressEducationTermDto,
    qr?: QueryRunner,
  ): Promise<EducationTermModel[]>;
}
