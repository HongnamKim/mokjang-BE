import { BaseOffsetPaginationResponseDto } from '../../../common/dto/reponse/base-offset-pagination-response.dto';
import { TaskModel } from '../../entity/task.entity';

export class TaskPaginationResultDto extends BaseOffsetPaginationResponseDto<TaskModel> {
  constructor(
    data: TaskModel[],
    totalCount: number,
    count: number,
    page: number,
    totalPage: number,
  ) {
    super(data, totalCount, count, page, totalPage);
  }
}
