import { BaseOffsetPaginationRequestDto } from '../../../common/dto/request/base-offset-pagination-request.dto';
import { GetNewMemberDetailOrderEnum } from '../../const/get-new-member-detail-order.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { WidgetRangeEnum } from '../../const/widget-range.enum';
import { IsYYYYMMDD } from '../../../common/decorator/validator/is-yyyy-mm-dd.validator';

export class GetNewMemberDetailDto extends BaseOffsetPaginationRequestDto<GetNewMemberDetailOrderEnum> {
  @ApiProperty({
    description: '정렬 조건',
    default: GetNewMemberDetailOrderEnum.REGISTERED_AT,
    enum: GetNewMemberDetailOrderEnum,
    required: false,
  })
  @IsEnum(GetNewMemberDetailOrderEnum)
  order: GetNewMemberDetailOrderEnum =
    GetNewMemberDetailOrderEnum.REGISTERED_AT;

  @ApiProperty({
    description: '신규 교인 검색 단위 범위',
    enum: WidgetRangeEnum,
    default: WidgetRangeEnum.WEEKLY,
  })
  @IsEnum(WidgetRangeEnum)
  range: WidgetRangeEnum = WidgetRangeEnum.WEEKLY;

  @ApiProperty({})
  @IsOptional()
  @IsDateString({ strict: true })
  @IsYYYYMMDD('periodStart')
  periodStart: string;
}
