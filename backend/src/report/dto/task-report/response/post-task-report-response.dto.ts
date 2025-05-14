import { BasePostResponseDto } from '../../../../common/dto/reponse/base-post-response.dto';
import { TaskReportModel } from '../../../entity/task-report.entity';

export class PostTaskReportResponseDto extends BasePostResponseDto<TaskReportModel> {
  constructor(data: TaskReportModel) {
    super(data);
  }
}
