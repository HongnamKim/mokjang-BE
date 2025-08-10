import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { BaseOffsetPaginationRequestDto } from '../../../../common/dto/request/base-offset-pagination-request.dto';
import { EducationTermOrder } from '../../const/education-term-order.enum';

export class GetInProgressEducationTermDto extends BaseOffsetPaginationRequestDto<EducationTermOrder> {
  @ApiProperty({
    description: '정렬 기준 (기본값: 기수)',
    enum: EducationTermOrder,
    default: EducationTermOrder.TERM,
    required: false,
  })
  @IsEnum(EducationTermOrder)
  order: EducationTermOrder = EducationTermOrder.TERM;
}
