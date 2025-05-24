import {
  MemberSummarizedRelation,
  MemberSummarizedSelect,
} from '../../members/const/member-find-options.const';
import { FindOptionsRelations, FindOptionsSelect } from 'typeorm';
import { TaskReportModel } from '../entity/task-report.entity';
import { EducationSessionReportModel } from '../entity/education-session-report.entity';

export const BaseReportFindOptionsSelect = {
  id: true,
  createdAt: true,
  updatedAt: true,
  reportedAt: true,
  isRead: true,
  isConfirmed: true,
};

export const EducationReportsFindOptionsRelation: FindOptionsRelations<EducationSessionReportModel> =
  {
    educationSession: {
      inCharge: MemberSummarizedRelation,
    },
  };

export const TaskReportsFindOptionsRelation: FindOptionsRelations<TaskReportModel> =
  {
    task: {
      inCharge: MemberSummarizedRelation,
    },
  };

export const TaskReportsFindOptionsSelect: FindOptionsSelect<TaskReportModel> =
  {
    ...BaseReportFindOptionsSelect,
    task: {
      id: true,
      title: true,
      startDate: true,
      endDate: true,
      status: true,
      inCharge: MemberSummarizedSelect,
    },
  };

export const TaskReportFindOptionsSelect: FindOptionsSelect<TaskReportModel> = {
  ...BaseReportFindOptionsSelect,
  task: {
    id: true,
    title: true,
    startDate: true,
    endDate: true,
    status: true,
    content: true,
    inCharge: MemberSummarizedSelect,
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
