import { BasePatchResponseDto } from '../../../common/dto/reponse/base-patch-response.dto';
import { ChurchUserModel } from '../../../church-user/entity/church-user.entity';

export class PatchManagerResponseDto extends BasePatchResponseDto<ChurchUserModel> {
  constructor(data: ChurchUserModel) {
    super(data);
  }
}
