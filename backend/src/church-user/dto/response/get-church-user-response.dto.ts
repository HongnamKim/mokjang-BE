import { BaseGetResponseDto } from '../../../common/dto/reponse/base-get-response.dto';
import { ChurchUserModel } from '../../entity/church-user.entity';

export class GetChurchUserResponseDto extends BaseGetResponseDto<ChurchUserModel> {
  constructor(data: ChurchUserModel) {
    super(data);
  }
}
