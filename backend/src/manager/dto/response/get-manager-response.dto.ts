import { BaseGetResponseDto } from '../../../common/dto/reponse/base-get-response.dto';
import { ChurchUserModel } from '../../../church-user/entity/church-user.entity';

export class GetManagerResponseDto extends BaseGetResponseDto<ChurchUserModel> {
  constructor(data: ChurchUserModel) {
    super(data);
  }
}
