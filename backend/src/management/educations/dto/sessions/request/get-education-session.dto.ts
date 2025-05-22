import { BaseOffsetPaginationRequestDto } from '../../../../../common/dto/request/base-offset-pagination-request.dto';
import { EducationSessionOrderEnum } from '../../../const/order.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export class GetEducationSessionDto extends BaseOffsetPaginationRequestDto<EducationSessionOrderEnum> {
  @ApiProperty({
    description: '정렬 기준 (회차 / 생성일 / 수정일)',
    enum: EducationSessionOrderEnum,
    default: EducationSessionOrderEnum.session,
    required: false,
  })
  @IsOptional()
  @IsEnum(EducationSessionOrderEnum)
  order: EducationSessionOrderEnum = EducationSessionOrderEnum.session;
}
