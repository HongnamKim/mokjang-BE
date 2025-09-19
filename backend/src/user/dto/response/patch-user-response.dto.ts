import { BasePatchResponseDto } from '../../../common/dto/reponse/base-patch-response.dto';
import { UserModel } from '../../entity/user.entity';

export class PatchUserResponseDto extends BasePatchResponseDto<UserModel> {
  constructor(data: UserModel) {
    super(data);
  }
}
