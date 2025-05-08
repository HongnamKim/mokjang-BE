import { BasePatchResponseDto } from '../../../common/dto/reponse/base-patch-response.dto';
import { TaskModel } from '../../entity/task.entity';

export class PatchTaskResponseDto extends BasePatchResponseDto<TaskModel> {
  constructor(data: TaskModel) {
    super(data);
  }
}
