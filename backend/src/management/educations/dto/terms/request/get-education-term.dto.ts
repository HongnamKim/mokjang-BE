import { ApiProperty } from '@nestjs/swagger';
import { EducationTermOrderEnum } from '../../../const/order.enum';
import { IsEnum } from 'class-validator';
import { BaseOffsetPaginationRequestDto } from '../../../../../common/dto/request/base-offset-pagination-request.dto';

export class GetEducationTermDto extends BaseOffsetPaginationRequestDto<EducationTermOrderEnum> {
  @ApiProperty({
    description: '정렬 기준 (기본값: 기수)',
    enum: EducationTermOrderEnum,
    default: EducationTermOrderEnum.term,
    required: false,
  })
  @IsEnum(EducationTermOrderEnum)
  order: EducationTermOrderEnum = EducationTermOrderEnum.term;

  /*@ApiProperty({
    description: '회차명',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(2, 50)
  @IsNoSpecialChar()
  @RemoveSpaces()
  sessionTitle: string;*/
}
