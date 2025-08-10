import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';
import { BaseOffsetPaginationRequestDto } from '../../../../common/dto/request/base-offset-pagination-request.dto';
import { IsOptionalNotNull } from '../../../../common/decorator/validator/is-optional-not.null.validator';
import { IsNoSpecialChar } from '../../../../common/decorator/validator/is-no-special-char.validator';
import { RemoveSpaces } from '../../../../common/decorator/transformer/remove-spaces';
import { EducationTermOrder } from '../../const/education-term-order.enum';

export class GetEducationTermDto extends BaseOffsetPaginationRequestDto<EducationTermOrder> {
  @ApiProperty({
    description: '정렬 기준 (기본값: 기수)',
    enum: EducationTermOrder,
    default: EducationTermOrder.TERM,
    required: false,
  })
  @IsEnum(EducationTermOrder)
  order: EducationTermOrder = EducationTermOrder.TERM;

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
  sessionTitle?: string;

  @ApiProperty({
    description: '세션 담당자 ID',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  sessionInChargeId?: number;
}
