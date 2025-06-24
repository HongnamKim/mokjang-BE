import { BaseOffsetPaginationRequestDto } from '../../../../common/dto/request/base-offset-pagination-request.dto';
import { WorshipAttendanceOrderEnum } from '../../../const/worship-attendance-order.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, Min } from 'class-validator';
import { IsOptionalNotNull } from '../../../../common/decorator/validator/is-optional-not.null.validator';

export class GetWorshipAttendancesDto extends BaseOffsetPaginationRequestDto<WorshipAttendanceOrderEnum> {
  @ApiProperty({
    description: '정렬 조건',
    enum: WorshipAttendanceOrderEnum,
    required: false,
  })
  @IsOptionalNotNull()
  @IsEnum(WorshipAttendanceOrderEnum)
  order: WorshipAttendanceOrderEnum = WorshipAttendanceOrderEnum.CREATED_AT;

  @ApiProperty({
    description: '교인 그룹 ID',
    required: false,
  })
  @IsOptionalNotNull()
  @IsNumber()
  @Min(1)
  groupId?: number;
}
