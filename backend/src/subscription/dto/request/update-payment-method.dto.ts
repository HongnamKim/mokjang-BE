import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';
import { EncData } from './subscribe-plan.dto';

export class UpdatePaymentMethodDto extends EncData {
  @ApiProperty({
    description: '테스트 환경 여부',
    default: true,
  })
  @IsBoolean()
  isTest: boolean = true;
  /*
  @ApiProperty({
    description: '카드번호, 숫자만 입력',
    example: '1234123412341234',
  })
  @IsString()
  @Length(16, 16)
  cardNo: string;

  @ApiProperty({
    description: '유효기간(년, YY)',
    example: '25',
  })
  @IsString()
  @Length(2, 2)
  expYear: string;

  @ApiProperty({
    description: '유효기간(월, MM)',
    example: '09',
  })
  @IsString()
  @Length(2, 2)
  expMonth: string;

  @ApiProperty({
    description: '생년월일(YYMMDD) or 사업자번호(10자리)',
    example: '000101',
  })
  @IsString()
  @Length(6, 10)
  idNo: string;

  @ApiProperty({
    description: '카드 비밀번호 앞 2자리',
    example: '00',
  })
  @IsString()
  @Length(2, 2)
  cardPw: string;*/
}
