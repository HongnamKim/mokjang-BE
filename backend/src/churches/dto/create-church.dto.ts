import { ApiProperty, PickType } from '@nestjs/swagger';
import { ChurchModel } from '../entity/church.entity';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateChurchDto extends PickType(ChurchModel, ['name']) {
  @ApiProperty({
    name: 'name',
    description: '교회 이름',
    example: '교회',
  })
  @IsString()
  @IsNotEmpty()
  override name: string;
}
