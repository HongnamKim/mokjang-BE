import { BasePatchResponseDto } from '../../../../common/dto/reponse/base-patch-response.dto';
import { TaskReportModel } from '../../../entity/task-report.entity';

export class PatchTaskReportResponseDto extends BasePatchResponseDto<TaskReportModel> {
  constructor(data: TaskReportModel) {
    super(data);
  }
}
