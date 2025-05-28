import { BasePatchResponseDto } from '../../../common/dto/reponse/base-patch-response.dto';
import { MemberModel } from '../../../members/entity/member.entity';

export class PatchManagerResponseDto extends BasePatchResponseDto<MemberModel> {
  constructor(data: MemberModel) {
    super(data);
  }
}
