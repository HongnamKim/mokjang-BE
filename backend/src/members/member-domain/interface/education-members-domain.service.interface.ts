import { MemberModel } from '../../entity/member.entity';
import { EducationTermModel } from '../../../educations/education-term/entity/education-term.entity';
import { QueryRunner } from 'typeorm';
import { ChurchModel } from '../../../churches/entity/church.entity';
import { GetNotEnrolledMembersDto } from '../../../educations/education-enrollment/dto/request/get-not-enrolled-members.dto';

export const IEDUCATION_MEMBERS_DOMAIN_SERVICE = Symbol(
  'IEDUCATION_MEMBERS_DOMAIN_SERVICE',
);

export interface IEducationMembersDomainService {
  findNotEnrolledMembers(
    church: ChurchModel,
    educationTerm: EducationTermModel,
    dto: GetNotEnrolledMembersDto,
    qr?: QueryRunner,
  ): Promise<MemberModel[]>;
}
