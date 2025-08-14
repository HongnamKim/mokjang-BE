import { FindOptionsRelations, FindOptionsSelect } from 'typeorm';
import { EducationReportModel } from '../entity/education-report.entity';
import {
  MemberSummarizedRelation,
  MemberSummarizedSelect,
} from '../../../members/const/member-find-options.const';
import {
  BaseReportFindOptionsSelect,
  BaseReportSummarizedSelectQB,
} from '../../base-report/const/base-report-find-options.const';

export const EducationReportsFindOptionsRelation: FindOptionsRelations<EducationReportModel> =
  {
    educationSession: {
      inCharge: MemberSummarizedRelation,
    },
  };

export const EducationReportsFindOptionsSelect: FindOptionsSelect<EducationReportModel> =
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

export const EducationReportFindOptionsSelect: FindOptionsSelect<EducationReportModel> =
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

export const EducationReportSummarizedSelectQB: string[] = [
  ...BaseReportSummarizedSelectQB,
  'report.educationReportType',
];
