import { TaskReportModel } from '../entity/task-report.entity';
import { BaseOffsetPaginationResponseDto } from '../../../common/dto/reponse/base-offset-pagination-response.dto';

export class TaskReportPaginationResultDto {
  constructor(
    public readonly data: TaskReportModel[],
    public readonly timestamp: Date = new Date(),
  ) {}
}
