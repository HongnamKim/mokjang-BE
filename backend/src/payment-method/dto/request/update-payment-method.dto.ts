import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';
import { EncData } from '../enc-data.dto';

export class UpdatePaymentMethodDto extends EncData {
  @ApiProperty({
    description: '테스트 환경 여부',
    default: true,
  })
  @IsBoolean()
  isTest: boolean = true;
}
