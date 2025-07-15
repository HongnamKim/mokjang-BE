import { TaskModel } from '../../../task/entity/task.entity';
import { WidgetRangeEnum } from '../../const/widget-range.enum';

export class GetMyTasksResponseDto {
  constructor(
    public readonly range: WidgetRangeEnum,
    public readonly from: Date,
    public readonly to: Date,
    public readonly data: TaskModel[],
    public readonly timestamp: Date = new Date(),
  ) {}
}
