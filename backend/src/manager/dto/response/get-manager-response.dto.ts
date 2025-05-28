import { BaseGetResponseDto } from '../../../common/dto/reponse/base-get-response.dto';
import { MemberModel } from '../../../members/entity/member.entity';

export class GetManagerResponseDto extends BaseGetResponseDto<MemberModel> {
  constructor(data: MemberModel) {
    super(data);
  }
}
