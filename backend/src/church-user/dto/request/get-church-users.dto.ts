import { BaseOffsetPaginationRequestDto } from '../../../common/dto/request/base-offset-pagination-request.dto';
import { ChurchUserOrder } from '../../const/church-user-order.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ChurchUserRole } from '../../../user/const/user-role.enum';

export class GetChurchUsersDto extends BaseOffsetPaginationRequestDto<ChurchUserOrder> {
  @ApiProperty({
    description: '정렬 기준 (교회 가입일 / 생성일 / 수정일)',
    enum: ChurchUserOrder,
    default: ChurchUserOrder.JOINED_AT,
    required: false,
  })
  @IsOptional()
  @IsEnum(ChurchUserOrder)
  order: ChurchUserOrder = ChurchUserOrder.JOINED_AT;

  @ApiProperty({
    description: '교인 이름 검색',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiProperty({
    description: '교인의 역할 필터링',
    enum: ChurchUserRole,
    required: false,
  })
  @IsOptional()
  @IsEnum(ChurchUserRole)
  role?: ChurchUserRole;
}
