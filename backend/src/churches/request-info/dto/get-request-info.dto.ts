import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class GetRequestInfoDto {
  @ApiProperty({
    name: 'take',
    description: '조회할 데이터 개수',
    default: 50,
    example: 50,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  take?: number = 50;

  @ApiProperty({
    name: 'page',
    description: '조회할 페이지',
    default: 1,
    example: 1,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  page?: number = 1;
}
