import { BaseGetResponseDto } from '../../../common/dto/reponse/base-get-response.dto';
import { MemberModel } from '../../entity/member.entity';

export class ConcealedMemberDto extends MemberModel {
  public isConcealed: boolean;
}

export class GetMemberResponseDto extends BaseGetResponseDto<ConcealedMemberDto> {
  constructor(data: ConcealedMemberDto) {
    super(data);
  }
}
