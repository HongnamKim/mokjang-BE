import { BaseDomainOffsetPaginationResultDto } from '../../common/dto/base-domain-offset-pagination-result.dto';
import { TaskModel } from '../entity/task.entity';

export class TaskDomainPaginationResultDto extends BaseDomainOffsetPaginationResultDto<TaskModel> {
  constructor(data: TaskModel[], totalCount: number) {
    super(data, totalCount);
  }
}
