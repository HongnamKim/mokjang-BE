import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptionalNotNull } from '../../common/decorator/validator/is-optional-not.null.validator';

export class LogoutDto {
  @ApiProperty({
    description: '기기 식별용 UUID - 클라이언트에서 생성 후 관리 필요',
    required: false,
  })
  @IsUUID()
  @IsOptionalNotNull()
  deviceId?: string;
}
