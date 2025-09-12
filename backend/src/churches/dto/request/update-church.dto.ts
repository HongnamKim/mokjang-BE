import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateChurchDto } from './create-church.dto';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { IsOptionalNotNull } from '../../../common/decorator/validator/is-optional-not.null.validator';

export class UpdateChurchDto extends PartialType(CreateChurchDto) {
  memberCount?: number;

  @ApiProperty({
    name: 'name',
    description: '교회 이름',
    example: '교회',
  })
  @IsOptionalNotNull()
  @IsString()
  @MaxLength(50)
  @IsNotEmpty()
  override name?: string;

  @ApiProperty({
    description: '교단',
  })
  @IsOptionalNotNull()
  @IsString()
  @MaxLength(50)
  @IsNotEmpty()
  override denomination?: string;

  @ApiProperty({
    description: '고유번호',
  })
  @IsOptionalNotNull()
  @IsString()
  @MaxLength(50)
  @IsNotEmpty()
  override identifyNumber?: string;

  @ApiProperty({
    description: '담임목사',
  })
  @IsOptionalNotNull()
  @IsString()
  @MaxLength(30)
  override pastor?: string;

  @ApiProperty({
    description: '교회 전화번호',
  })
  @IsOptionalNotNull()
  @IsString()
  @MaxLength(50)
  @IsNotEmpty()
  override phone?: string;

  @ApiProperty({
    description: '교회 주소',
  })
  @IsOptionalNotNull()
  @IsString()
  @MaxLength(50)
  @IsNotEmpty()
  override address?: string;

  @ApiProperty({
    description: '교회 상세 주소',
  })
  @IsOptionalNotNull()
  @IsString()
  @MaxLength(50)
  @IsNotEmpty()
  override detailAddress?: string;
}
