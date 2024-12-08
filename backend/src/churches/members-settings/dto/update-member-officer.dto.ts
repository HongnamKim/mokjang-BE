import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateMemberOfficerDto {
  @ApiProperty({
    name: 'isDeleteOfficer',
    description: '교인의 직분 삭제 시 true',
    default: false,
    required: true,
  })
  @IsOptional()
  @IsBoolean()
  isDeleteOfficer: boolean = false;

  @ApiProperty({
    name: 'officerId',
    description: '<p>직분 ID</p><p>직분 삭제 시 값 전달할 필요 없음</p>',
    example: 1,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  officerId: number;

  @ApiProperty({
    name: 'officerStartDate',
    description: '임직일',
    example: '2019-02-01',
    required: false,
  })
  @IsDate()
  @IsOptional()
  officerStartDate?: Date;

  @ApiProperty({
    name: 'officerStartChurch',
    description: '임직 교회',
    example: 'AA 교회',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  officerStartChurch?: string;
}
