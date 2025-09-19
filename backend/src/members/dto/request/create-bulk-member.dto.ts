import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsBoolean,
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { IsYYYYMMDD } from '../../../common/decorator/validator/is-yyyy-mm-dd.validator';
import { RemoveSpaces } from '../../../common/decorator/transformer/remove-spaces';
import { IsNoSpecialChar } from '../../../common/decorator/validator/is-no-special-char.validator';

export class BulkMemberDto {
  @ApiPropertyOptional({
    description: '교회 등록일자 (YYYY-MM-DD)',
    default: new Date().toISOString().slice(0, 10),
  })
  @IsDateString({ strict: true })
  @IsYYYYMMDD('등록일쟈')
  @IsOptional()
  등록일자?: string; //"2025-09-22",

  @ApiProperty()
  @IsString()
  @RemoveSpaces()
  @IsNotEmpty()
  @IsNoSpecialChar()
  @MaxLength(30)
  이름: string; //"김철수",

  @ApiProperty()
  @IsString()
  @IsPhoneNumber('KR')
  휴대전화번호: string; //"01043215678",

  @ApiPropertyOptional({
    description: '생년월일 (YYYY-MM-DD)',
    default: new Date().toISOString().slice(0, 10),
  })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsYYYYMMDD('생년월일')
  생년월일?: string; //"1999-04-15",

  @ApiProperty()
  @IsBoolean()
  음력: boolean; //"",

  @ApiProperty()
  @IsBoolean()
  윤달: boolean; //"",

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsIn(['남', '여', ''])
  성별?: string; //"남",

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsString()
  주소?: string; //"",

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsString()
  상세주소?: string; //"",

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsString()
  직업?: string; //"",

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsString()
  학교?: string; //"",

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsIn(['기혼', '미혼', ''])
  결혼여부?: string; //"미혼",

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsString()
  차량번호?: string; //"123가4567"
}

export class CreateBulkMemberDto {
  @ApiProperty({
    description: '교인 데이터 배열',
    type: BulkMemberDto,
    isArray: true,
  })
  @ValidateNested({ each: true })
  @Type(() => BulkMemberDto)
  @ArrayMaxSize(500)
  members: BulkMemberDto[];
}
