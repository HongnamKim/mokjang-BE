import { BaseGetResponseDto } from '../../../common/dto/reponse/base-get-response.dto';
import { TaskModel } from '../../entity/task.entity';

export class GetSubTaskResponseDto extends BaseGetResponseDto<TaskModel[]> {
  constructor(
    public readonly data: TaskModel[],
    public readonly parentTaskId: number,
  ) {
    super(data);
  }
}
