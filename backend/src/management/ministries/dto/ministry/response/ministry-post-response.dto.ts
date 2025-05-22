import { BasePostResponseDto } from '../../../../../common/dto/reponse/base-post-response.dto';
import { MinistryModel } from '../../../entity/ministry.entity';

export class MinistryPostResponseDto extends BasePostResponseDto<MinistryModel> {
  constructor(public readonly data: MinistryModel) {
    super(data);
  }
}
