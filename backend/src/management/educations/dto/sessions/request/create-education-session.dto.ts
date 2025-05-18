import { ApiProperty, PickType } from '@nestjs/swagger';
import { EducationSessionModel } from '../../../entity/education-session.entity';
import { EducationSessionStatus } from '../../../const/education-status.enum';
import { SanitizeDto } from '../../../../../common/decorator/sanitize-target.decorator';
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
import { RemoveSpaces } from '../../../../../common/decorator/transformer/remove-spaces';
import { IsNoSpecialChar } from '../../../../../common/decorator/validator/is-no-special-char.validator';
import { IsAfterDate } from '../../../../../common/decorator/validator/is-after-date.decorator';
import { IsOptionalNotNull } from '../../../../../common/decorator/validator/is-optional-not.null.validator';
import { PlainTextMaxLength } from '../../../../../common/decorator/validator/plain-text-max-length.validator';

@SanitizeDto()
export class CreateEducationSessionDto extends PickType(EducationSessionModel, [
  'name',
  'startDate',
  'endDate',
  'inChargeId',
  'content',
  'status',
]) {
  @ApiProperty({
    description: '교육 회차명',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @RemoveSpaces()
  @IsNoSpecialChar()
  @MaxLength(50)
  override name: string;

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
  @PlainTextMaxLength(1000)
  override content: string;

  @ApiProperty({
    description: '진행 상태',
    enum: EducationSessionStatus,
    default: EducationSessionStatus.RESERVE,
  })
  @IsEnum(EducationSessionStatus)
  override status: EducationSessionStatus = EducationSessionStatus.RESERVE;
}
