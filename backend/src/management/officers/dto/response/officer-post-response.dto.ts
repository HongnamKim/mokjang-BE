import { BasePostResponseDto } from '../../../../common/dto/reponse/base-post-response.dto';
import { OfficerModel } from '../../entity/officer.entity';

export class OfficerPostResponse extends BasePostResponseDto<OfficerModel> {
  constructor(public readonly data: OfficerModel) {
    super(data);
  }
}
