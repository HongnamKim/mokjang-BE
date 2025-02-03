import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, Length } from 'class-validator';
import { TestEnvironment } from '../const/test-environment.enum';

export class RequestVerificationCodeDto {
  @ApiProperty({
    description: '인증 문자 전송 환경 (기본값: internalTest)',
    required: false,
  })
  @IsOptional()
  @IsEnum(TestEnvironment)
  isTest: TestEnvironment = TestEnvironment.InternalTest;

  @ApiProperty({
    name: 'name',
    description: '이름',
    example: '이름',
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    name: 'mobilePhone',
    description: '휴대전화 번호',
    example: '01012341234',
  })
  @IsNotEmpty()
  @Length(10, 11)
  mobilePhone: string;
}
