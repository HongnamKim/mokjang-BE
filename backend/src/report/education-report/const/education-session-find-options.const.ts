import { FindOptionsRelations, FindOptionsSelect } from 'typeorm';
import { EducationSessionReportModel } from '../entity/education-session-report.entity';
import {
  MemberSummarizedRelation,
  MemberSummarizedSelect,
} from '../../../members/const/member-find-options.const';
import { BaseReportFindOptionsSelect } from '../../base-report/const/base-report-find-options.const';

export const EducationReportsFindOptionsRelation: FindOptionsRelations<EducationSessionReportModel> =
  {
    educationSession: {
      inCharge: MemberSummarizedRelation,
    },
  };

export const EducationReportsFindOptionsSelect: FindOptionsSelect<EducationSessionReportModel> =
  {
    ...BaseReportFindOptionsSelect,
    educationId: true,
    educationTermId: true,
    educationSessionId: true,
    educationSession: {
      id: true,
      title: true,
      session: true,
      startDate: true,
      endDate: true,
      status: true,
      inCharge: MemberSummarizedSelect,
    },
  };

export const EducationReportFindOptionsSelect: FindOptionsSelect<EducationSessionReportModel> =
  {
    ...BaseReportFindOptionsSelect,
    educationId: true,
    educationTermId: true,
    educationSessionId: true,
    educationSession: {
      id: true,
      title: true,
      session: true,
      startDate: true,
      endDate: true,
      status: true,
      content: true,
      inCharge: MemberSummarizedSelect,
    },
  };
