import { BasePostResponseDto } from '../../../common/dto/reponse/base-post-response.dto';
import { ChurchJoinModel } from '../../entity/church-join.entity';

export class PostJoinRequestResponseDto extends BasePostResponseDto<ChurchJoinModel> {
  constructor(data: ChurchJoinModel) {
    super(data);
  }
}
