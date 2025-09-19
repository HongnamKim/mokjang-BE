import { BaseGetResponseDto } from '../../../common/dto/reponse/base-get-response.dto';
import { UserModel } from '../../../user/entity/user.entity';

export class GetMeResponseDto extends BaseGetResponseDto<UserModel> {
  constructor(data: UserModel) {
    super(data);
  }
}
