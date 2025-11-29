import { IsIn, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDeviceDto {
  @IsString()
  @ApiProperty({
    description: 'FCM 토큰',
  })
  token: string;

  @ApiProperty({
    description: '기기 OS',
  })
  @IsIn(['android', 'ios'])
  platform: 'android' | 'ios';

  @ApiProperty({
    description: '기기 식별용 UUID - 클라이언트에서 생성 후 관리 필요',
  })
  @IsUUID()
  deviceId: string;
}
