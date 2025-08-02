import { ApiProperty, PickType } from '@nestjs/swagger';
import { EducationTermModel } from '../../../entity/education-term.entity';
import { IsDate, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { SanitizeDto } from '../../../../common/decorator/sanitize-target.decorator';
import { IsOptionalNotNull } from '../../../../common/decorator/validator/is-optional-not.null.validator';
import { PlainTextMaxLength } from '../../../../common/decorator/validator/plain-text-max-length.validator';
import { IsAfterDate } from '../../../../common/decorator/validator/is-after-date.decorator';

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
}
