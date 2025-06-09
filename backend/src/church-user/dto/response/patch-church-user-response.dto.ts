import { BasePatchResponseDto } from '../../../common/dto/reponse/base-patch-response.dto';
import { ChurchUserModel } from '../../entity/church-user.entity';

export class PatchChurchUserResponseDto extends BasePatchResponseDto<ChurchUserModel> {
  constructor(data: ChurchUserModel) {
    super(data);
  }
}
