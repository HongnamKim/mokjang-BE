import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GetRecommendLinkMemberDto {
  @ApiProperty({
    description: '가입 신청자 이름',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: '가입 신청자 휴대전화 번호',
  })
  @IsString()
  @IsNotEmpty()
  mobilePhone: string;
}
