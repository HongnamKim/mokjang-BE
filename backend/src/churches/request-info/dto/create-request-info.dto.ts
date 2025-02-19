import { ApiProperty, PickType } from '@nestjs/swagger';
import { RequestInfoModel } from '../entity/request-info.entity';
import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { TransformName } from '../../decorator/transform-name';
import { FamilyRelation } from '../../members/const/family-relation.const';

export class CreateRequestInfoDto extends PickType(RequestInfoModel, [
  'name',
  'mobilePhone',
]) {
  @ApiProperty({
    name: 'name',
    description: '새신자 이름',
    example: '새신자',
  })
  @IsString()
  @IsNotEmpty()
  @TransformName()
  @Matches(/^[a-zA-Z0-9가-힣 \-]+$/, {
    message: '특수문자는 사용할 수 없습니다.',
  })
  override name: string;

  @ApiProperty({
    name: 'mobilePhone',
    description: '휴대전화 번호',
    example: '01012341234',
  })
  @IsString()
  @IsNotEmpty()
  @Length(10, 11)
  @Matches(/^[0-9]+$/, { message: '숫자만 입력 가능합니다' })
  override mobilePhone: string;

  @ApiProperty({
    name: 'guidedById',
    description: '인도자 ID',
    example: 12,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  guidedById?: number;

  @ApiProperty({
    name: 'familyMemberId',
    description: '가족 ID',
    example: 21,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  familyMemberId?: number;

  @ApiProperty({
    name: 'relation',
    description: '가족 관계',
    example: FamilyRelation.MOTHER,
    required: false,
  })
  @IsString()
  @IsIn(Object.values(FamilyRelation))
  @IsOptional()
  relation?: string;
}
