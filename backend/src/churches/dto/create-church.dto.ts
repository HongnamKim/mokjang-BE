import { ApiProperty, PickType } from '@nestjs/swagger';
import { ChurchModel } from '../entity/church.entity';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { MemberSize } from '../const/member-size.enum';

export class CreateChurchDto extends PickType(ChurchModel, [
  'name',
  'identifyNumber',
  'phone',
  'denomination',
  'address',
  'detailAddress',
  'memberSize',
]) {
  @ApiProperty({
    name: 'name',
    description: '교회 이름',
    example: '교회',
  })
  @IsString()
  @IsNotEmpty()
  override name: string;

  @ApiProperty({
    description: '고유번호',
  })
  @IsString()
  @IsNotEmpty()
  override identifyNumber: string;

  @ApiProperty({
    description: '교회 전화번호',
  })
  @IsString()
  @IsNotEmpty()
  override phone: string;

  @ApiProperty({
    description: '교단',
  })
  @IsString()
  @IsNotEmpty()
  override denomination: string;

  @ApiProperty({
    description: '교회 주소',
  })
  @IsString()
  @IsNotEmpty()
  override address: string;

  @ApiProperty({
    description: '교회 상세 주소',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  override detailAddress: string;

  @ApiProperty({
    description: '교회 규모',
    enum: MemberSize,
  })
  @IsEnum(MemberSize)
  override memberSize: MemberSize;
}
