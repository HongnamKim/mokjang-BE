import { BaseOffsetPaginationRequestDto } from '../../../../common/dto/request/base-offset-pagination-request.dto';
import { WorshipEnrollmentOrderEnum } from '../../../const/worship-enrollment-order.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { IsOptionalNotNull } from '../../../../common/decorator/validator/is-optional-not.null.validator';
import { fromZonedTime } from 'date-fns-tz';
import { TIME_ZONE } from '../../../../common/const/time-zone.const';
import { IsYYYYMMDD } from '../../../../common/decorator/validator/is-yyyy-mm-dd.validator';
import { Transform } from 'class-transformer';

export class GetWorshipEnrollmentsDto extends BaseOffsetPaginationRequestDto<WorshipEnrollmentOrderEnum> {
  @ApiProperty({
    description: '정렬 조건',
    enum: WorshipEnrollmentOrderEnum,
    default: WorshipEnrollmentOrderEnum.NAME,
    required: false,
  })
  @IsEnum(WorshipEnrollmentOrderEnum)
  order: WorshipEnrollmentOrderEnum = WorshipEnrollmentOrderEnum.NAME;

  @ApiProperty({
    description: '교인 그룹',
    required: false,
    type: 'string',
  })
  @IsOptional()
  @Transform(({ value }) => +value)
  groupId?: number;

  @ApiProperty({
    description: '불러올 예배 세션 시작 날짜 (YYYY-MM-DD)',
    required: false,
  })
  @IsOptionalNotNull()
  @IsDateString({ strict: true })
  @IsYYYYMMDD('fromSessionDate')
  fromSessionDate: string;

  @ApiProperty({
    description: '불러올 예배 세션 마지막 날짜 (YYYY-MM-DD)',
    required: false,
  })
  @IsOptionalNotNull()
  @IsDateString({ strict: true })
  @IsYYYYMMDD('toSessionDate')
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
