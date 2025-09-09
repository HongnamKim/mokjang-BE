import { ApiProperty, PickType } from '@nestjs/swagger';
import { EducationTermModel } from '../../entity/education-term.entity';
import {
  ArrayUnique,
  IsArray,
  IsDateString,
  IsNumber,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { SanitizeDto } from '../../../../common/decorator/sanitize-target.decorator';
import { IsOptionalNotNull } from '../../../../common/decorator/validator/is-optional-not.null.validator';
import { IsAfterDate } from '../../../../common/decorator/validator/is-after-date.decorator';
import { IsBasicText } from '../../../../common/decorator/validator/is-no-special-char.validator';
import { EducationTermConstraints } from '../../const/education-term.constraints';
import { IsYYYYMMDD } from '../../../../common/decorator/validator/is-yyyy-mm-dd.validator';

@SanitizeDto()
export class CreateEducationTermDto extends PickType(EducationTermModel, [
  'term',
  'location',
  'inChargeId',
]) {
  @ApiProperty({
    description: '기수',
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  override term: number;

  @ApiProperty({
    description: '장소 (30자 미만)',
    required: false,
  })
  @IsOptionalNotNull()
  @IsString()
  @MaxLength(EducationTermConstraints.MAX_LOCATION_LENGTH)
  @IsBasicText('장소')
  override location: string;

  @ApiProperty({
    description: '교육회차 시작일 (yyyy-MM-dd)',
  })
  @IsDateString({ strict: true })
  @IsYYYYMMDD('startDate')
  startDate: string;

  utcStartDate: Date;

  @ApiProperty({
    description: '교육회차 종료일 (yyyy-MM-dd)',
  })
  @IsDateString({ strict: true })
  @IsYYYYMMDD('endDate')
  @IsAfterDate('startDate')
  endDate: string;

  utcEndDate: Date;

  @ApiProperty({
    description: '교육 진행자 ID',
    minimum: 1,
    //required: false,
  })
  @IsNumber()
  @Min(1)
  //@IsOptional()
  override inChargeId: number;

  @ApiProperty({
    description: '피보고자 ID',
    isArray: true,
  })
  @IsOptionalNotNull()
  @IsArray()
  @ArrayUnique()
  @IsNumber({}, { each: true })
  @Min(1, { each: true })
  receiverIds: number[];
}
