import { ApiProperty, PickType } from '@nestjs/swagger';
import { ChurchModel } from '../entity/church.entity';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateChurchDto extends PickType(ChurchModel, [
  'name',
  'identifyNumber',
  'pastor',
  'phone',
  'denomination',
  'address',
  'detailAddress',
]) {
  @ApiProperty({
    name: 'name',
    description: '교회 이름',
    example: '교회',
  })
  @IsString()
  @MaxLength(50)
  @IsNotEmpty()
  override name: string;

  @ApiProperty({
    description: '교단',
  })
  @IsString()
  @MaxLength(50)
  @IsNotEmpty()
  override denomination: string;

  @ApiProperty({
    description: '고유번호',
  })
  @IsString()
  @MaxLength(50)
  @IsNotEmpty()
  override identifyNumber: string;

  @ApiProperty({
    description: '담임목사',
  })
  @IsString()
  @MaxLength(30)
  override pastor: string;

  @ApiProperty({
    description: '교회 전화번호',
  })
  @IsString()
  @MaxLength(50)
  @IsNotEmpty()
  override phone: string;

  @ApiProperty({
    description: '교회 주소',
  })
  @IsString()
  @MaxLength(50)
  @IsNotEmpty()
  override address: string;

  @ApiProperty({
    description: '교회 상세 주소',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  @IsNotEmpty()
  override detailAddress: string;
}
