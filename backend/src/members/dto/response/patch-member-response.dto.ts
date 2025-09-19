import { BasePatchResponseDto } from '../../../common/dto/reponse/base-patch-response.dto';
import { MemberModel } from '../../entity/member.entity';

export class PatchMemberResponseDto extends BasePatchResponseDto<MemberModel> {
  constructor(data: MemberModel) {
    super(data);
  }
}
