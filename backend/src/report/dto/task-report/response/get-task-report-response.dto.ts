import { BaseGetResponseDto } from '../../../../common/dto/reponse/base-get-response.dto';
import { TaskReportModel } from '../../../entity/task-report.entity';

export class GetTaskReportResponseDto extends BaseGetResponseDto<TaskReportModel> {
  constructor(data: TaskReportModel) {
    super(data);
  }
}
