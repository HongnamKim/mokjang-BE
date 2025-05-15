import { ChurchModel } from '../../../../../churches/entity/church.entity';
import { EducationModel } from '../../../entity/education.entity';
import { GetEducationTermDto } from '../../../dto/terms/get-education-term.dto';
import {
  FindOptionsRelations,
  FindOptionsSelect,
  QueryRunner,
  UpdateResult,
} from 'typeorm';
import { EducationTermModel } from '../../../entity/education-term.entity';
import { CreateEducationTermDto } from '../../../dto/terms/create-education-term.dto';
import { UpdateEducationTermDto } from '../../../dto/terms/update-education-term.dto';
import { EducationEnrollmentStatus } from '../../../const/education-status.enum';
import { MemberModel } from '../../../../../members/entity/member.entity';

export const IEDUCATION_TERM_DOMAIN_SERVICE = Symbol(
  'IEDUCATION_TERM_DOMAIN_SERVICE',
);

export interface IEducationTermDomainService {
  findEducationTerms(
    church: ChurchModel,
    education: EducationModel,
    dto: GetEducationTermDto,
    qr?: QueryRunner,
  ): Promise<{ data: EducationTermModel[]; totalCount: number }>;

  findEducationTermById(
    church: ChurchModel,
    education: EducationModel,
    educationTermId: number,
    qr?: QueryRunner,
  ): Promise<EducationTermModel>;

  findEducationTermModelById(
    church: ChurchModel,
    education: EducationModel,
    educationTermId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<EducationTermModel>,
    selectOptions?: FindOptionsSelect<EducationTermModel>,
  ): Promise<EducationTermModel>;

  createEducationTerm(
    education: EducationModel,
    creator: MemberModel,
    instructor: MemberModel | null,
    dto: CreateEducationTermDto,
    qr: QueryRunner,
  ): Promise<EducationTermModel>;

  updateEducationTerm(
    education: EducationModel,
    educationTerm: EducationTermModel,
    newInstructor: MemberModel | null,
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

  incrementDoneCount(
    educationTerm: EducationTermModel,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  decrementDoneCount(
    educationTerm: EducationTermModel,
    qr: QueryRunner,
  ): Promise<UpdateResult>;
}
