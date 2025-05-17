import { ApiProperty, PickType } from '@nestjs/swagger';
import { EducationTermModel } from '../../../entity/education-term.entity';
import { IsDate, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { IsAfterDate } from '../../../../../common/decorator/validator/is-after-date.decorator';
import { SanitizeDto } from '../../../../../common/decorator/sanitize-target.decorator';
import { PlainTextMaxLength } from '../../../../../common/decorator/validator/plain-text-max-length.validator';
import { IsOptionalNotNull } from '../../../../../common/decorator/validator/is-optional-not.null.validator';

@SanitizeDto()
export class CreateEducationTermDto extends PickType(EducationTermModel, [
  'term',
  'content',
  'startDate',
  'endDate',
  'inChargeId',
]) {
  @ApiProperty({
    description: '기수',
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  term: number;

  @ApiProperty({
    description: '내용',
    required: false,
  })
  @IsOptionalNotNull()
  @IsString()
  @PlainTextMaxLength(500)
  override content: string;

  @ApiProperty({
    description: '교육회차 시작일',
  })
  @IsDate()
  override startDate: Date;

  @ApiProperty({
    description: '교육회차 종료일',
  })
  @IsDate()
  @IsAfterDate('startDate')
  override endDate: Date;

  @ApiProperty({
    description: '교육 진행자 ID',
    minimum: 1,
    required: false,
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  override inChargeId: number;

  /*@ApiProperty({
    description: '총 몇 회의 교육으로 이루어졌는지 (최소값: 1)',
    minimum: 1,
    default: 1,
  })
  @IsNumber()
  @Min(1)
  override numberOfSessions: number = 1;*/

  /*@ApiProperty({
    description: '수료 기준 출석 횟수 (선택값)',
    minimum: 1,
    required: false,
  })
  @ValidateIf((o) => o.numberOfSessions !== undefined)
  @IsNumber()
  @Min(1)
  @IsLessThanOrEqual('numberOfSessions')
  @IsOptional()
  override completionCriteria: number;*/
}
