import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteDeviceDto {
  @IsUUID()
  @ApiProperty({
    description: '기기 식별용 UUID - 클라이언트에서 생성 후 관리 필요',
  })
  deviceId: string;
}
