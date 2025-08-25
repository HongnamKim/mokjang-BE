import { BasePostResponseDto } from '../../../common/dto/reponse/base-post-response.dto';
import { ChurchModel } from '../../entity/church.entity';

export class PostChurchResponseDto extends BasePostResponseDto<ChurchModel> {
  constructor(data: ChurchModel) {
    super(data);
  }
}
