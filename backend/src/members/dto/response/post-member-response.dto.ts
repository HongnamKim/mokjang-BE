import { BasePostResponseDto } from '../../../common/dto/reponse/base-post-response.dto';
import { MemberModel } from '../../entity/member.entity';

export class PostMemberResponseDto extends BasePostResponseDto<MemberModel> {
  constructor(data: MemberModel) {
    super(data);
  }
}
