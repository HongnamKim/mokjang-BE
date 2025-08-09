import { FindOptionsRelations, FindOptionsSelect } from 'typeorm';
import { TaskReportModel } from '../entity/task-report.entity';
import {
  MemberSummarizedRelation,
  MemberSummarizedSelect,
} from '../../../members/const/member-find-options.const';
import { BaseReportFindOptionsSelect } from '../../base-report/const/base-report-find-options.const';

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
