import { FindOptionsRelations, FindOptionsSelect } from 'typeorm';
import { VisitationReportModel } from '../entity/visitation-report.entity';
import {
  MemberSummarizedRelation,
  MemberSummarizedSelect,
} from '../../../members/const/member-find-options.const';
import { BaseReportFindOptionsSelect } from '../../base-report/const/base-report-find-options.const';

export const VisitationReportsFindOptionsRelation: FindOptionsRelations<VisitationReportModel> =
  {
    visitation: {
      members: MemberSummarizedRelation,
      inCharge: MemberSummarizedRelation,
    },
  };

export const VisitationReportFindOptionsRelation: FindOptionsRelations<VisitationReportModel> =
  {
    visitation: {
      members: MemberSummarizedRelation,
      inCharge: MemberSummarizedRelation,
    },
  };

export const VisitationReportsFindOptionsSelect: FindOptionsSelect<VisitationReportModel> =
  {
    ...BaseReportFindOptionsSelect,
    visitation: {
      id: true,
      status: true,
      visitationMethod: true,
      visitationType: true,
      startDate: true,
      endDate: true,
      title: true,
      inCharge: MemberSummarizedSelect,
      members: MemberSummarizedSelect,
    },
  };

export const VisitationReportFindOptionsSelect: FindOptionsSelect<VisitationReportModel> =
  {
    ...BaseReportFindOptionsSelect,
    visitation: {
      id: true,
      status: true,
      visitationMethod: true,
      visitationType: true,
      startDate: true,
      endDate: true,
      title: true,
      inCharge: MemberSummarizedSelect,
      members: MemberSummarizedSelect,
    },
  };
