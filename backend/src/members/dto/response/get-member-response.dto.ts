import { BaseGetResponseDto } from '../../../common/dto/reponse/base-get-response.dto';
import { MemberModel } from '../../entity/member.entity';

export class GetMemberResponseDto extends BaseGetResponseDto<MemberModel> {
  constructor(data: MemberModel) {
    super(data);
  }
}
