import { ApiProperty } from '@nestjs/swagger';
import { EducationTermOrderEnum } from '../../../const/order.enum';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';
import { BaseOffsetPaginationRequestDto } from '../../../../../common/dto/request/base-offset-pagination-request.dto';
import { IsNoSpecialChar } from '../../../../../common/decorator/validator/is-no-special-char.validator';
import { RemoveSpaces } from '../../../../../common/decorator/transformer/remove-spaces';
import { IsOptionalNotNull } from '../../../../../common/decorator/validator/is-optional-not.null.validator';

export class GetEducationTermDto extends BaseOffsetPaginationRequestDto<EducationTermOrderEnum> {
  @ApiProperty({
    description: '정렬 기준 (기본값: 기수)',
    enum: EducationTermOrderEnum,
    default: EducationTermOrderEnum.term,
    required: false,
  })
  @IsEnum(EducationTermOrderEnum)
  order: EducationTermOrderEnum = EducationTermOrderEnum.term;

  @ApiProperty({
    description: '기수 담당자 ID',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  termInChargeId?: number;

  @ApiProperty({
    description: '세션명',
    required: false,
  })
  @IsOptionalNotNull()
  @IsString()
  @Length(2, 50)
  @IsNoSpecialChar()
  @RemoveSpaces()
  sessionName?: string;

  @ApiProperty({
    description: '세션 담당자 ID',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  sessionInChargeId?: number;
}
