import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { GroupRoleOrderEnum } from '../../const/group-role-order.enum';
import { BaseOffsetPaginationRequestDto } from '../../../../common/dto/request/base-offset-pagination-request.dto';

export class GetGroupRoleDto extends BaseOffsetPaginationRequestDto<GroupRoleOrderEnum> {
  @ApiProperty({
    description: '정렬 기준 (생성일, 수정일, 이름)',
    enum: GroupRoleOrderEnum,
    default: GroupRoleOrderEnum.createdAt,
    required: false,
  })
  @IsEnum(GroupRoleOrderEnum)
  @IsOptional()
  order: GroupRoleOrderEnum = GroupRoleOrderEnum.createdAt;
}
