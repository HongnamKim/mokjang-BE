import { BaseGetResponseDto } from '../../../common/dto/reponse/base-get-response.dto';
import { TaskModel } from '../../entity/task.entity';

export class GetTaskResponseDto extends BaseGetResponseDto<TaskModel> {
  constructor(data: TaskModel, timestamp: Date) {
    super(data, timestamp);
  }
}
