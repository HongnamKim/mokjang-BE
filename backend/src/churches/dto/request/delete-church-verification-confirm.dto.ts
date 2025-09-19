import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class DeleteChurchVerificationConfirmDto {
  @ApiProperty({ description: '인증 코드' })
  @IsString()
  @Length(6, 6)
  inputCode: string;
}
