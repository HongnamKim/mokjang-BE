import { EducationSessionOrder } from '../../const/education-session-order.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { BaseOffsetPaginationRequestDto } from '../../../../common/dto/request/base-offset-pagination-request.dto';

export class GetEducationSessionDto extends BaseOffsetPaginationRequestDto<EducationSessionOrder> {
  @ApiProperty({
    description: '정렬 기준 (회차 / 생성일 / 수정일)',
    enum: EducationSessionOrder,
    default: EducationSessionOrder.SESSION,
    required: false,
  })
  @IsOptional()
  @IsEnum(EducationSessionOrder)
  order: EducationSessionOrder = EducationSessionOrder.SESSION;
}
