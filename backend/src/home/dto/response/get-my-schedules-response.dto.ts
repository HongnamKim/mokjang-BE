import { WidgetRangeEnum } from '../../const/widget-range.enum';

export class GetMySchedulesResponseDto<T> {
  constructor(
    public readonly range: WidgetRangeEnum,
    public readonly from: Date,
    public readonly to: Date,
    public readonly data: T[],
    public readonly timestamp: Date = new Date(),
  ) {}
}
