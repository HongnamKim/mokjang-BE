import { EducationTermOrderEnum } from '../../../const/order.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { BaseOffsetPaginationRequestDto } from '../../../../common/dto/request/base-offset-pagination-request.dto';

export class GetInProgressEducationTermDto extends BaseOffsetPaginationRequestDto<EducationTermOrderEnum> {
  @ApiProperty({
    description: '정렬 기준 (기본값: 기수)',
    enum: EducationTermOrderEnum,
    default: EducationTermOrderEnum.term,
    required: false,
  })
  @IsEnum(EducationTermOrderEnum)
  order: EducationTermOrderEnum = EducationTermOrderEnum.term;
}
