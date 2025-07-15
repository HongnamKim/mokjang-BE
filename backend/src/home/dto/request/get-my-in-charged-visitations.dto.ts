import { BaseOffsetPaginationRequestDto } from '../../../common/dto/request/base-offset-pagination-request.dto';
import { VisitationOrderEnum } from '../../../visitation/const/visitation-order.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsIn, IsOptional } from 'class-validator';
import { WidgetRangeEnum } from '../../const/widget-range.enum';
import { IsYYYYMMDD } from '../../../common/decorator/validator/is-yyyy-mm-dd.validator';
import { IsAfterDate } from '../../../common/decorator/validator/is-after-date.decorator';

export class GetMyInChargedVisitationsDto extends BaseOffsetPaginationRequestDto<VisitationOrderEnum> {
  @ApiProperty({
    description: '정렬 조건',
    default: VisitationOrderEnum.endDate,
    enum: VisitationOrderEnum,
    required: false,
  })
  @IsOptional()
  @IsEnum(VisitationOrderEnum)
  order: VisitationOrderEnum = VisitationOrderEnum.endDate;

  @ApiProperty({
    description: '정렬 오름차순/내림차순',
    default: 'DESC',
    required: false,
  })
  @IsIn(['asc', 'desc', 'ASC', 'DESC'])
  @IsOptional()
  override orderDirection: 'ASC' | 'DESC' | 'asc' | 'desc' = 'DESC';

  @ApiProperty({
    description: '검색 단위 (주간 / 월간)',
    enum: WidgetRangeEnum,
  })
  @IsEnum(WidgetRangeEnum)
  range: WidgetRangeEnum;

  @ApiProperty({
    description: '검색 시작일(YYYY-MM-DD)',
    required: false,
  })
  @IsOptional()
  @IsDateString({ strict: true })
  @IsYYYYMMDD('from')
  from?: string;

  @ApiProperty({
    description: '검색 종료일(YYYY-MM-DD)',
    required: false,
  })
  @IsOptional()
  @IsDateString({ strict: true })
  @IsAfterDate('from')
  @IsYYYYMMDD('to')
  to?: string;
}
