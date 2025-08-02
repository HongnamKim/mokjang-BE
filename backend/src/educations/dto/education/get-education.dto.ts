import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { EducationOrderEnum } from '../../const/order.enum';
import { IsOptionalNotNull } from '../../../common/decorator/validator/is-optional-not.null.validator';
import { IsNoSpecialChar } from '../../../common/decorator/validator/is-no-special-char.validator';
import { RemoveSpaces } from '../../../common/decorator/transformer/remove-spaces';

export class GetEducationDto {
  @ApiProperty({
    description: '요청 데이터 개수',
    default: 20,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  take: number = 20;

  @ApiProperty({
    description: '요청 페이지',
    default: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  page: number = 1;

  @ApiProperty({
    description: '정렬 기준 (이름, 생성일, 수정일)',
    enum: EducationOrderEnum,
    default: EducationOrderEnum.name,
    required: false,
  })
  @IsEnum(EducationOrderEnum)
  @IsOptional()
  order: EducationOrderEnum = EducationOrderEnum.name;

  @ApiProperty({
    description: '정렬 내림차순 / 오름차순',
    default: 'asc',
    required: false,
  })
  @IsIn(['asc', 'desc', 'ASC', 'DESC'])
  @IsOptional()
  orderDirection: 'asc' | 'desc' | 'ASC' | 'DESC' = 'asc';

  @ApiProperty({
    description: '교육명',
    required: false,
  })
  @IsOptionalNotNull()
  @IsString()
  @Length(2, 50)
  @IsNoSpecialChar()
  @RemoveSpaces()
  name?: string;
}
