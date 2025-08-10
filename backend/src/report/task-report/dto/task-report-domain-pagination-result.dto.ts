import { BaseDomainOffsetPaginationResultDto } from '../../../common/dto/base-domain-offset-pagination-result.dto';
import { TaskReportModel } from '../entity/task-report.entity';

export class TaskReportDomainPaginationResultDto extends BaseDomainOffsetPaginationResultDto<TaskReportModel> {
  constructor(data: TaskReportModel[], totalCount: number) {
    super(data, totalCount);
  }
}
