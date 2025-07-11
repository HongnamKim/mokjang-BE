import { BaseOffsetPaginationRequestDto } from '../../../../common/dto/request/base-offset-pagination-request.dto';
import { WorshipEnrollmentOrderEnum } from '../../../const/worship-enrollment-order.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNumber, Matches } from 'class-validator';
import { IsOptionalNotNull } from '../../../../common/decorator/validator/is-optional-not.null.validator';
import { fromZonedTime } from 'date-fns-tz';
import { TIME_ZONE } from '../../../../common/const/time-zone.const';

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
    description: '불러올 예배 세션 시작 날짜 (YYYY-MM-DD)',
    required: false,
  })
  @IsOptionalNotNull()
  @IsDateString({ strict: true })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'fromSessionDate는 YYYY-MM-DD 형식이어야 합니다.',
  })
  fromSessionDate: string;

  @ApiProperty({
    description: '불러올 예배 세션 마지막 날짜 (YYYY-MM-DD)',
    required: false,
  })
  @IsOptionalNotNull()
  @IsDateString({ strict: true })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'toSessionDate는 YYYY-MM-DD 형식이어야 합니다.',
  })
  toSessionDate: string;

  get fromSessionDateUtc(): Date | undefined {
    return this.fromSessionDate
      ? fromZonedTime(`${this.fromSessionDate}T00:00:00`, TIME_ZONE.SEOUL)
      : undefined;
  }

  get toSessionDateUtc(): Date | undefined {
    return this.toSessionDate
      ? fromZonedTime(`${this.toSessionDate}T00:00:00`, TIME_ZONE.SEOUL)
      : undefined;
  }
}
