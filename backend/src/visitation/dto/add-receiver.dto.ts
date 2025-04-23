import { ApiProperty, PickType } from '@nestjs/swagger';
import { CreateVisitationDto } from './create-visitation.dto';
import { IsArray, IsNumber, IsOptional, Min } from 'class-validator';

export class AddReceiverDto extends PickType(CreateVisitationDto, [
  'receiverIds',
]) {
  @ApiProperty({
    description: '심방 피보고자 ID',
    isArray: true,
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Min(1, { each: true })
  override receiverIds: number[];
}
