import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class AssignMinistryToMemberDto {
  @ApiProperty({
    description: '교인 ID',
  })
  @IsNumber()
  @Min(1)
  memberId: number;
}
