import { FindOptionsRelations, FindOptionsSelect } from 'typeorm';
import { TaskModel } from '../entity/task.entity';
import {
  MemberSummarizedRelation,
  MemberSummarizedSelect,
} from '../../members/const/member-find-options.const';

export const TasksFindOptionsRelation: FindOptionsRelations<TaskModel> = {
  subTasks: {
    inCharge: MemberSummarizedRelation,
  },
  inCharge: MemberSummarizedRelation,
};

const SubTaskFindOptionsSelect: FindOptionsSelect<TaskModel> = {
  id: true,
  title: true,
  taskStartDate: true,
  taskEndDate: true,
  createdAt: true,
  updatedAt: true,
  taskType: true,
  taskStatus: true,
  parentTaskId: true,
  inCharge: MemberSummarizedSelect,
};

export const TasksFindOptionsSelect: FindOptionsSelect<TaskModel> = {
  id: true,
  createdAt: true,
  updatedAt: true,
  churchId: true,
  taskType: true,
  title: true,
  taskStatus: true,
  taskStartDate: true,
  taskEndDate: true,
  subTasks: SubTaskFindOptionsSelect,
  inCharge: MemberSummarizedSelect,
};

export const TaskFindOptionsRelation: FindOptionsRelations<TaskModel> = {
  parentTask: true,
  subTasks: {
    inCharge: MemberSummarizedRelation,
  },
  inCharge: MemberSummarizedRelation,
  creator: MemberSummarizedRelation,
  reports: { receiver: MemberSummarizedRelation },
};

export const TaskFindOptionsSelect: FindOptionsSelect<TaskModel> = {
  parentTask: {
    id: true,
    title: true,
    taskStatus: true,
    taskStartDate: true,
    taskEndDate: true,
  },
  subTasks: SubTaskFindOptionsSelect,
  inCharge: MemberSummarizedSelect,
  creator: MemberSummarizedSelect,
  reports: {
    id: true,
    isRead: true,
    isConfirmed: true,
    receiver: MemberSummarizedSelect,
  },
};
