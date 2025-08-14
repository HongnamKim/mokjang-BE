import {
  InChargeSummarizedSelect,
  MemberSummarizedRelation,
} from '../../../members/const/member-find-options.const';
import { FindOptionsRelations, FindOptionsSelect } from 'typeorm';
import { EducationTermModel } from '../entity/education-term.entity';

export const EducationTermSelectOptions: FindOptionsSelect<EducationTermModel> =
  {
    id: true,
    createdAt: true,
    updatedAt: true,
    educationId: true,
    educationName: true,
    creatorId: true,
    term: true,
    status: true,
    sessionsCount: true,
    startDate: true,
    endDate: true,
    inChargeId: true,
    completedSessionsCount: true,
    enrollmentsCount: true,
    completedMembersCount: true,
    inCharge: InChargeSummarizedSelect,
  };

export const EducationTermRelationOptions: FindOptionsRelations<EducationTermModel> =
  {
    inCharge: MemberSummarizedRelation,
  };
