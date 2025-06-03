import { ChurchModel } from '../../../../../churches/entity/church.entity';
import { GetEducationDto } from '../../../dto/education/get-education.dto';
import { FindOptionsRelations, QueryRunner } from 'typeorm';
import { EducationModel } from '../../../entity/education.entity';
import { CreateEducationDto } from '../../../dto/education/create-education.dto';
import { UpdateEducationDto } from '../../../dto/education/update-education.dto';
import { ChurchUserModel } from '../../../../../church-user/entity/church-user.entity';

export const IEDUCATION_DOMAIN_SERVICE = Symbol('IEDUCATION_DOMAIN_SERVICE');

export interface IEducationDomainService {
  findEducations(
    church: ChurchModel,
    dto: GetEducationDto,
    qr?: QueryRunner,
  ): Promise<{ data: EducationModel[]; totalCount: number }>;

  findEducationById(
    church: ChurchModel,
    educationId: number,
    qr?: QueryRunner,
  ): Promise<EducationModel>;

  findEducationModelById(
    church: ChurchModel,
    educationId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<EducationModel>,
  ): Promise<EducationModel>;

  createEducation(
    church: ChurchModel,
    //creatorMember: MemberModel,
    creatorMember: ChurchUserModel,
    dto: CreateEducationDto,
    qr?: QueryRunner,
  ): Promise<EducationModel>;

  updateEducation(
    church: ChurchModel,
    targetEducation: EducationModel,
    dto: UpdateEducationDto,
    qr: QueryRunner,
  ): Promise<EducationModel>;

  deleteEducation(
    targetEducation: EducationModel,
    qr?: QueryRunner,
  ): Promise<void>;
}
