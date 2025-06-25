import { BaseOffsetPaginationRequestDto } from '../../../../common/dto/request/base-offset-pagination-request.dto';
import { WorshipEnrollmentOrderEnum } from '../../../const/worship-enrollment-order.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsEnum, IsNumber } from 'class-validator';
import { IsOptionalNotNull } from '../../../../common/decorator/validator/is-optional-not.null.validator';

export class GetWorshipEnrollmentsDto extends BaseOffsetPaginationRequestDto<WorshipEnrollmentOrderEnum> {
  @ApiProperty({
    description: '정렬 조건',
    enum: WorshipEnrollmentOrderEnum,
    default: WorshipEnrollmentOrderEnum.ID,
    required: false,
  })
  @IsEnum(WorshipEnrollmentOrderEnum)
  order: WorshipEnrollmentOrderEnum = WorshipEnrollmentOrderEnum.ID;

  @ApiProperty({
    description: '교인 그룹',
    required: false,
  })
  @IsOptionalNotNull()
  @IsNumber()
  groupId: number;

  @ApiProperty({
    description: '불러올 예배 세션 시작 날짜',
    required: false,
  })
  @IsOptionalNotNull()
  @IsDate()
  fromSessionDate: Date;

  @ApiProperty({
    description: '불러올 예배 세션 마지막 날짜',
    required: false,
  })
  @IsOptionalNotNull()
  @IsDate()
  toSessionDate: Date;
}
