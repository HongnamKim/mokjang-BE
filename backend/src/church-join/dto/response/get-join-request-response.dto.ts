import { BaseGetResponseDto } from '../../../common/dto/reponse/base-get-response.dto';
import { ChurchJoinModel } from '../../entity/church-join.entity';

export class GetJoinRequestResponseDto extends BaseGetResponseDto<ChurchJoinModel> {
  constructor(data: ChurchJoinModel) {
    super(data);
  }
}
