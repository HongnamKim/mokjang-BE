import { TaskModel } from '../../entity/task.entity';

export class TaskPaginationResultDto {
  constructor(public readonly data: TaskModel[]) {}
}
