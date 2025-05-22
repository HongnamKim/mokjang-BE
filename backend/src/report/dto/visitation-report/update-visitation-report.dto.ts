import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateVisitationReportDto {
  @ApiProperty({
    description: '읽음 처리',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isRead?: boolean;

  @ApiProperty({
    description: '확인 처리',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isConfirmed?: boolean;
}
