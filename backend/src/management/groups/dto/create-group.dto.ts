import { ApiProperty, PickType } from '@nestjs/swagger';
import { GroupModel } from '../entity/group.entity';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateGroupDto extends PickType(GroupModel, [
  'name',
  'parentGroupId',
]) {
  @ApiProperty({
    name: 'name',
    description: '소그룹 이름',
    example: '청년부',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.replaceAll(' ', ''))
  override name: string;

  @ApiProperty({
    name: 'parentGroupId',
    description: '상위 그룹 ID',
    example: 2,
  })
  @IsNumber()
  @IsOptional()
  override parentGroupId: number;
}
