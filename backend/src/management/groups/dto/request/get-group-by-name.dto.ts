import { BaseOffsetPaginationRequestDto } from '../../../../common/dto/request/base-offset-pagination-request.dto';
import { GroupOrderEnum } from '../../const/group-order.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { IsNoSpecialChar } from '../../../../common/decorator/validator/is-no-special-char.validator';
import { Transform } from 'class-transformer';
import { IsOptionalNotNull } from '../../../../common/decorator/validator/is-optional-not.null.validator';

export class GetGroupByNameDto extends BaseOffsetPaginationRequestDto<GroupOrderEnum> {
  @ApiProperty({
    description: '정렬 기준',
    enum: GroupOrderEnum,
    default: GroupOrderEnum.createdAt,
    required: false,
  })
  @IsEnum(GroupOrderEnum)
  @IsOptional()
  order: GroupOrderEnum = GroupOrderEnum.createdAt;

  @ApiProperty({
    description: '검색 이름',
    required: false,
  })
  @IsOptionalNotNull()
  @IsString()
  @IsNotEmpty()
  @IsNoSpecialChar()
  @Transform(({ value }) => value.replaceAll(' ', ''))
  name: string;
}
