import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MobileLoginDto {
  @ApiProperty({
    description: 'OAuth 제공사',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  provider: string;

  @ApiProperty({
    description: 'OAuth id',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  providerId: string;
}
