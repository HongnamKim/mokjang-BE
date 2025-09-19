import { BaseOffsetPaginationRequestDto } from '../../../../common/dto/request/base-offset-pagination-request.dto';
import { WorshipAttendanceOrder } from '../../../const/worship-attendance-order.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, Min } from 'class-validator';
import { IsOptionalNotNull } from '../../../../common/decorator/validator/is-optional-not.null.validator';

export class GetWorshipAttendancesDto extends BaseOffsetPaginationRequestDto<WorshipAttendanceOrder> {
  @ApiProperty({
    description: '정렬 조건',
    enum: WorshipAttendanceOrder,
    default: WorshipAttendanceOrder.ID,
    required: false,
  })
  @IsOptionalNotNull()
  @IsEnum(WorshipAttendanceOrder)
  order: WorshipAttendanceOrder = WorshipAttendanceOrder.ID;

  @ApiProperty({
    description: '교인 그룹 ID',
    required: false,
  })
  @IsOptionalNotNull()
  @IsNumber()
  @Min(1)
  groupId?: number;
}
