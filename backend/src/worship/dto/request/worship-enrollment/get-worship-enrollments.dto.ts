import { BaseOffsetPaginationRequestDto } from '../../../../common/dto/request/base-offset-pagination-request.dto';
import { WorshipEnrollmentOrderEnum } from '../../../const/worship-enrollment-order.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber } from 'class-validator';
import { IsOptionalNotNull } from '../../../../common/decorator/validator/is-optional-not.null.validator';

export class GetWorshipEnrollmentsDto extends BaseOffsetPaginationRequestDto<WorshipEnrollmentOrderEnum> {
  @ApiProperty({
    description: '정렬 조건',
    enum: WorshipEnrollmentOrderEnum,
    default: WorshipEnrollmentOrderEnum.CREATED_AT,
    required: false,
  })
  @IsEnum(WorshipEnrollmentOrderEnum)
  order: WorshipEnrollmentOrderEnum = WorshipEnrollmentOrderEnum.CREATED_AT;

  @ApiProperty({
    description: '교인 그룹',
    required: false,
  })
  @IsOptionalNotNull()
  @IsNumber()
  groupId: number;
}
