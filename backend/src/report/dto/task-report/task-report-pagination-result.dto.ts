import { TaskReportModel } from '../../entity/task-report.entity';
import { BaseOffsetPaginationResponseDto } from '../../../common/dto/reponse/base-offset-pagination-response.dto';

export class TaskReportPaginationResultDto extends BaseOffsetPaginationResponseDto<TaskReportModel> {
  constructor(
    data: TaskReportModel[],
    totalCount: number,
    count: number,
    page: number,
    totalPage: number,
  ) {
    super(data, totalCount, count, page, totalPage);
  }
}
