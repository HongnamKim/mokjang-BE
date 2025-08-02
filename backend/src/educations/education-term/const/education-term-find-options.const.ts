import {
  MemberSummarizedRelation,
  MemberSummarizedSelect,
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
    enrollmentCount: true,
    //inProgressCount: true,
    completedCount: true,
    incompleteCount: true,
    inCharge: MemberSummarizedSelect,
  };

export const EducationTermRelationOptions: FindOptionsRelations<EducationTermModel> =
  {
    inCharge: MemberSummarizedRelation,
  };
