import { ApiProperty, PickType } from '@nestjs/swagger';
import { PositionModel } from '../../entity/position.entity';
import { IsNotEmpty, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreatePositionDto extends PickType(PositionModel, [
  'name',
  'churchId',
]) {
  @ApiProperty({
    name: 'name',
    description: '직분 이름 (띄어쓰기 포함 시 띄어쓰기가 사라짐)',
    example: '장로',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.replaceAll(' ', ''))
  override name: string;
}
