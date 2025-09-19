import { ApiProperty, PickType } from '@nestjs/swagger';
import { EducationSessionModel } from '../../entity/education-session.entity';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { EducationSessionConstraints } from '../../const/education-session-constraints.const';
import { SanitizeDto } from '../../../../common/decorator/sanitize-target.decorator';
import { RemoveSpaces } from '../../../../common/decorator/transformer/remove-spaces';
import { IsBasicText } from '../../../../common/decorator/validator/is-no-special-char.validator';
import { IsAfterDate } from '../../../../common/decorator/validator/is-after-date.decorator';
import { IsOptionalNotNull } from '../../../../common/decorator/validator/is-optional-not.null.validator';
import { PlainTextMaxLength } from '../../../../common/decorator/validator/plain-text-max-length.validator';
import { IsDateTime } from '../../../../common/decorator/validator/is-date-time.validator';
import { ReportException } from '../../../../report/exception/report.exception';

@SanitizeDto()
export class CreateEducationSessionDto extends PickType(EducationSessionModel, [
  'title',
  'inChargeId',
  'content',
]) {
  @ApiProperty({
    description: '교육 회차명',
    maxLength: EducationSessionConstraints.MAX_SESSION_CONTENT_LENGTH,
  })
  @IsString()
  @IsNotEmpty()
  @RemoveSpaces()
  @IsBasicText('title')
  @MaxLength(EducationSessionConstraints.MAX_SESSION_NAME_LENGTH)
  override title: string;

  @ApiProperty({
    description: '시작 날짜 (yyyy-MM-ddTHH:MM:SS)',
  })
  @IsDateString({ strict: true })
  @IsDateTime('startDate')
  startDate: string;

  utcStartDate: Date;

  @ApiProperty({
    description: '종료 날짜 (yyyy-MM-ddTHH:MM:SS)',
  })
  @IsDateString({ strict: true })
  @IsDateTime('endDate')
  @IsAfterDate('startDate')
  endDate: string;

  utcEndDate: Date;

  @ApiProperty({
    description: '담당자 교인 ID',
    required: false,
  })
  //@IsOptional()
  @IsNumber()
  @Min(1)
  override inChargeId: number;

  @ApiProperty({
    description: '내용',
    default: '',
  })
  @IsOptionalNotNull()
  @IsString()
  @PlainTextMaxLength(EducationSessionConstraints.MAX_SESSION_CONTENT_LENGTH)
  override content: string;

  @ApiProperty({
    description: '피보고자 ID',
    isArray: true,
  })
  @IsOptionalNotNull()
  @IsArray()
  @ArrayUnique()
  @IsNumber({}, { each: true })
  @Min(1, { each: true })
  @ArrayMaxSize(30, { message: ReportException.EXCEED_RECEIVERS })
  receiverIds: number[];
}
