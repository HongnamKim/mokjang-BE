import { ChurchModel } from '../../../../../churches/entity/church.entity';
import { EducationModel } from '../../../entity/education.entity';
import { GetEducationTermDto } from '../../../dto/terms/get-education-term.dto';
import {
  FindOptionsRelations,
  FindOptionsSelect,
  QueryRunner,
  UpdateResult,
} from 'typeorm';
import { EducationTermPaginationResultDto } from '../../../dto/education-term-pagination-result.dto';
import { EducationTermModel } from '../../../entity/education-term.entity';
import { MemberModel } from '../../../../../churches/members/entity/member.entity';
import { CreateEducationTermDto } from '../../../dto/terms/create-education-term.dto';
import { EducationEnrollmentModel } from '../../../entity/education-enrollment.entity';
import { UpdateEducationTermDto } from '../../../dto/terms/update-education-term.dto';
import { EducationStatus } from '../../../const/education-status.enum';

export const IEDUCATION_TERM_DOMAIN_SERVICE = Symbol(
  'IEDUCATION_TERM_DOMAIN_SERVICE',
);

export interface IEducationTermDomainService {
  findEducationTerms(
    church: ChurchModel,
    education: EducationModel,
    dto: GetEducationTermDto,
    qr?: QueryRunner,
  ): Promise<EducationTermPaginationResultDto>;

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
    church: ChurchModel,
    education: EducationModel,
    instructor: MemberModel | null,
    dto: CreateEducationTermDto,
    qr: QueryRunner,
  ): Promise<EducationTermModel>;

  updateEducationTerm(
    education: EducationModel,
    educationTerm: EducationTermModel & {
      educationEnrollments: EducationEnrollmentModel[];
    },
    newInstructor: MemberModel | null,
    dto: UpdateEducationTermDto,
    qr: QueryRunner,
  ): Promise<EducationTermModel>;

  deleteEducationTerm(
    educationTerm: EducationTermModel,
    qr?: QueryRunner,
  ): Promise<string>;

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
    status: EducationStatus,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  decrementEducationStatusCount(
    educationTerm: EducationTermModel,
    status: EducationStatus,
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
