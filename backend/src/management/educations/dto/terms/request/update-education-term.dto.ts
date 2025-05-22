import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { IsAfterDate } from '../../../../../common/decorator/validator/is-after-date.decorator';
import { TransformStartDate } from '../../../../../member-history/decorator/transform-start-date.decorator';
import { TransformEndDate } from '../../../../../member-history/decorator/transform-end-date.decorator';
import { EducationTermStatus } from '../../../const/education-status.enum';
import { PlainTextMaxLength } from '../../../../../common/decorator/validator/plain-text-max-length.validator';
import { SanitizeDto } from '../../../../../common/decorator/sanitize-target.decorator';
import { IsOptionalNotNull } from '../../../../../common/decorator/validator/is-optional-not.null.validator';

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
    description: '내용',
    required: false,
  })
  @IsOptionalNotNull()
  @IsString()
  @PlainTextMaxLength(500)
  content?: string;

  @ApiProperty({
    description: '교육 진행 상태',
    enum: EducationTermStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(EducationTermStatus)
  status: EducationTermStatus;

  @ApiProperty({
    description: '교육회차 시작일',
  })
  @IsOptional()
  @IsDate()
  @TransformStartDate()
  startDate: Date;

  @ApiProperty({
    description: '교육회차 종료일',
  })
  @IsOptional()
  @IsDate()
  @TransformEndDate()
  @IsAfterDate('startDate')
  endDate: Date;

  @ApiProperty({
    description: '교육 진행자 ID',
    minimum: 1,
    required: false,
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  inChargeId: number;

  /*@ApiProperty({
    description: '총 몇 회의 교육으로 이루어졌는지 (최소값: 1)',
    minimum: 1,
    default: 1,
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  numberOfSessions: number;*/

  /*@ApiProperty({
    description: '수료 기준 출석 횟수 (선택값)',
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  //@ValidateIf((o) => o.numberOfSessions !== undefined)
  @IsLessThanOrEqual('numberOfSessions')
  completionCriteria: number;*/
}
