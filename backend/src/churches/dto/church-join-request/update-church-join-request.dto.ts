import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import { ChurchJoinRequestModel } from '../../entity/church-join-request.entity';
import { ChurchJoinRequestStatusEnum } from '../../const/church-join-request-status.enum';

export class UpdateChurchJoinRequestDto extends PartialType(
  PickType(ChurchJoinRequestModel, ['status']),
) {
  @ApiProperty({
    description: '',
  })
  override status: ChurchJoinRequestStatusEnum;
}
