import { ApiProperty, PickType } from '@nestjs/swagger';
import { MinistryModel } from '../../entity/ministry.entity';
import { IsNotEmpty, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateMinistryDto extends PickType(MinistryModel, ['name']) {
  @ApiProperty({
    name: 'name',
    description: '사역 이름 (띄어쓰기 제거됨)',
    example: '청소',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.replaceAll(' ', ''))
  override name: string;
}
