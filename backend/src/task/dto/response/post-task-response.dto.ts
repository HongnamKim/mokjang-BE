import { BasePostResponseDto } from '../../../common/dto/reponse/base-post-response.dto';
import { TaskModel } from '../../entity/task.entity';

export class PostTaskResponseDto extends BasePostResponseDto<TaskModel> {
  constructor(data: TaskModel, timestamp: Date) {
    super(data, timestamp);
  }
}
