import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';

import { IsArray, IsOptional } from 'class-validator';
import { CreateVisitationMetaDto } from './meta/create-visitation-meta.dto';
import { TransformNumberArray } from '../../common/decorator/transformer/transform-array';

export class UpdateVisitationDto extends PartialType(
  OmitType(CreateVisitationMetaDto, ['creator', 'visitationType']),
) {
  @ApiProperty({
    description: '심방 대상자 추가할 교인 ID 들',
    isArray: true,
    required: false,
  })
  @IsOptional()
  @IsArray()
  @TransformNumberArray()
  addMemberIds?: number[];

  @ApiProperty({
    description: '심방 대상자 제거할 교인 ID 들',
    isArray: true,
    required: false,
  })
  @IsOptional()
  @IsArray()
  @TransformNumberArray()
  deleteMemberIds?: number[];
}
