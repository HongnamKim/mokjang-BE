import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { SanitizeDto } from '../../../../common/decorator/sanitize-target.decorator';
import { IsOptionalNotNull } from '../../../../common/decorator/validator/is-optional-not.null.validator';
import { IsAfterDate } from '../../../../common/decorator/validator/is-after-date.decorator';
import { EducationTermStatus } from '../../const/education-term-status.enum';
import { EducationTermConstraints } from '../../const/education-term.constraints';
import { IsBasicText } from '../../../../common/decorator/validator/is-no-special-char.validator';
import { IsYYYYMMDD } from '../../../../common/decorator/validator/is-yyyy-mm-dd.validator';

@SanitizeDto()
export class UpdateEducationTermDto {
  @ApiProperty({
    description: '기수',
    minimum: 1,
    required: false,
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  term: number;

  @ApiProperty({
    description: '장소 (30자 미만)',
    required: false,
  })
  @IsOptionalNotNull()
  @IsString()
  @MaxLength(EducationTermConstraints.MAX_LOCATION_LENGTH)
  @IsBasicText('장소')
  location: string;

  @ApiProperty({
    description: '교육 진행 상태',
    enum: EducationTermStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(EducationTermStatus)
  status: EducationTermStatus;

  @ApiProperty({
    description: '교육회차 시작일 (yyyy-MM-dd)',
    required: false,
  })
  @IsOptionalNotNull()
  @IsDateString({ strict: true })
  @IsYYYYMMDD('startDate')
  startDate: string;

  utcStartDate: Date | undefined;

  @ApiProperty({
    description: '교육회차 종료일 (yyyy-MM-dd)',
    required: false,
  })
  @IsOptionalNotNull()
  @IsDateString({ strict: true })
  @IsYYYYMMDD('endDate')
  @IsAfterDate('startDate')
  endDate: string;

  utcEndDate: Date | undefined;

  @ApiProperty({
    description: '교육 진행자 ID',
    minimum: 1,
    required: false,
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  inChargeId: number;
}
