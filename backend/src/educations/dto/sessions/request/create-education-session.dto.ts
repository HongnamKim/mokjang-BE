import { ApiProperty, PickType } from '@nestjs/swagger';
import { EducationSessionModel } from '../../../entity/education-session.entity';
import { EducationSessionStatus } from '../../../const/education-status.enum';
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
import { EducationConstraints } from '../../../const/education-constraints.const';
import { SanitizeDto } from '../../../../common/decorator/sanitize-target.decorator';
import { RemoveSpaces } from '../../../../common/decorator/transformer/remove-spaces';
import { IsNoSpecialChar } from '../../../../common/decorator/validator/is-no-special-char.validator';
import { IsAfterDate } from '../../../../common/decorator/validator/is-after-date.decorator';
import { IsOptionalNotNull } from '../../../../common/decorator/validator/is-optional-not.null.validator';
import { PlainTextMaxLength } from '../../../../common/decorator/validator/plain-text-max-length.validator';

@SanitizeDto()
export class CreateEducationSessionDto extends PickType(EducationSessionModel, [
  'title',
  'startDate',
  'endDate',
  'inChargeId',
  'content',
  'status',
]) {
  @ApiProperty({
    description: '교육 회차명',
    maxLength: EducationConstraints.MAX_SESSION_CONTENT_LENGTH,
  })
  @IsString()
  @IsNotEmpty()
  @RemoveSpaces()
  @IsNoSpecialChar()
  @MaxLength(EducationConstraints.MAX_SESSION_NAME_LENGTH)
  override title: string;

  @ApiProperty({
    description: '시작 날짜',
  })
  @IsDate()
  override startDate: Date;

  @ApiProperty({
    description: '종료 날짜',
  })
  @IsDate()
  @IsAfterDate('startDate')
  override endDate: Date;

  @ApiProperty({
    description: '담당자 교인 ID',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  override inChargeId: number;

  @ApiProperty({
    description: '내용',
    default: '',
  })
  @IsOptionalNotNull()
  @IsString()
  @PlainTextMaxLength(EducationConstraints.MAX_SESSION_CONTENT_LENGTH)
  override content: string;

  @ApiProperty({
    description: '진행 상태',
    enum: EducationSessionStatus,
    default: EducationSessionStatus.RESERVE,
  })
  @IsEnum(EducationSessionStatus)
  override status: EducationSessionStatus = EducationSessionStatus.RESERVE;

  @ApiProperty({
    description: '피보고자 ID',
    isArray: true,
  })
  @IsOptional()
  @IsNumber({}, { each: true })
  @Min(1, { each: true })
  receiverIds: number[];
}
