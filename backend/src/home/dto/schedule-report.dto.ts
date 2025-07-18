import { ScheduleDto } from './schedule.dto';
import { MemberModel } from '../../members/entity/member.entity';
import { ScheduleType } from '../const/schedule-type.enum';

export class ScheduleReportDto {
  constructor(
    public readonly id: number,
    public readonly type: ScheduleType,
    public readonly inCharge: MemberModel,
    public readonly schedule: ScheduleDto,
  ) {}
}
