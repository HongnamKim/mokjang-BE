import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { SanitizeDto } from '../../../../../common/decorator/sanitize-target.decorator';
import { EducationSessionStatus } from '../../../const/education-status.enum';
import { IsOptionalNotNull } from '../../../../../common/decorator/validator/is-optional-not.null.validator';
import { RemoveSpaces } from '../../../../../common/decorator/transformer/remove-spaces';
import { IsNoSpecialChar } from '../../../../../common/decorator/validator/is-no-special-char.validator';
import { IsAfterDate } from '../../../../../common/decorator/validator/is-after-date.decorator';
import { PlainTextMaxLength } from '../../../../../common/decorator/validator/plain-text-max-length.validator';
import { EducationConstraints } from '../../../const/education-constraints.const';

@SanitizeDto()
export class UpdateEducationSessionDto {
  @ApiProperty({
    description: '교육 회차명',
    maxLength: 50,
    required: false,
  })
  @IsOptionalNotNull()
  @IsString()
  @IsNotEmpty()
  @RemoveSpaces()
  @IsNoSpecialChar()
  @MaxLength(50)
  name?: string;

  @ApiProperty({
    description: '시작 날짜',
    required: false,
  })
  @IsOptionalNotNull()
  @IsDate()
  startDate?: Date;

  @ApiProperty({
    description: '종료 날짜',
    required: false,
  })
  @IsOptionalNotNull()
  @IsDate()
  @IsAfterDate('startDate')
  endDate?: Date;

  @ApiProperty({
    description: '담당자 교인 ID (담당자 삭제 시 null)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  inChargeId?: number;

  @ApiProperty({
    description: '교육 진행 내용 (최대 1000자, 빈 문자열 허용)',
    required: false,
  })
  @IsOptionalNotNull()
  @IsString()
  @PlainTextMaxLength(EducationConstraints.MAX_SESSION_CONTENT_LENGTH)
  content?: string;

  @ApiProperty({
    description: '진행 상태',
    enum: EducationSessionStatus,
    required: false,
  })
  @IsOptionalNotNull()
  @IsEnum(EducationSessionStatus)
  status?: EducationSessionStatus;
}
