import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { GroupOrderEnum } from '../../const/group-order.enum';
import { BaseOffsetPaginationRequestDto } from '../../../../common/dto/request/base-offset-pagination-request.dto';

export class GetGroupDto extends BaseOffsetPaginationRequestDto<GroupOrderEnum> {
  @ApiProperty({
    description: '<p>부모 그룹 id</p>' + '<p>최상위 그룹 조회 시 포함 X</p>',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  parentGroupId: number = 0;

  @ApiProperty({
    description: '정렬 기준 (지정 순서, 생성일, 수정일, 이름)',
    enum: GroupOrderEnum,
    default: GroupOrderEnum.order,
    required: false,
  })
  @IsEnum(GroupOrderEnum)
  @IsOptional()
  order: GroupOrderEnum = GroupOrderEnum.order;
}
