import { BasePatchResponseDto } from '../../../common/dto/reponse/base-patch-response.dto';
import { ChurchJoinModel } from '../../entity/church-join.entity';

export class PatchJoinRequestResponseDto extends BasePatchResponseDto<ChurchJoinModel> {
  constructor(data: ChurchJoinModel) {
    super(data);
  }
}
