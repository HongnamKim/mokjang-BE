import { FindOptionsRelations, FindOptionsSelect } from 'typeorm';
import { TaskModel } from '../entity/task.entity';

export const TaskFindOptionsRelation: FindOptionsRelations<TaskModel> = {
  parentTask: true,
  subTasks: {
    inCharge: {
      officer: true,
      group: true,
      groupRole: true,
    },
  },
  inCharge: {
    officer: true,
    group: true,
    groupRole: true,
  },
  creator: {
    officer: true,
    group: true,
    groupRole: true,
  },
};

export const TaskFindOptionsSelect: FindOptionsSelect<TaskModel> = {
  parentTask: {
    id: true,
    title: true,
    taskStatus: true,
  },
  subTasks: {
    id: true,
    title: true,
    taskStatus: true,
    taskStartDate: true,
    taskEndDate: true,
    inChargeId: true,
    inCharge: {
      id: true,
      name: true,
      officer: {
        id: true,
        name: true,
      },
      group: {
        id: true,
        name: true,
      },
      groupRole: {
        id: true,
        role: true,
      },
    },
  },
  inCharge: {
    id: true,
    name: true,
    officer: {
      id: true,
      name: true,
    },
    group: {
      id: true,
      name: true,
    },
    groupRole: {
      id: true,
      role: true,
    },
  },
  creator: {
    id: true,
    name: true,
    officer: {
      id: true,
      name: true,
    },
    group: {
      id: true,
      name: true,
    },
    groupRole: {
      id: true,
      role: true,
    },
  },
};
