import { BasePostResponseDto } from '../../../../common/dto/reponse/base-post-response.dto';
import { ChurchEventModel } from '../../../entity/church-event.entity';

export class PostChurchEventResponseDto extends BasePostResponseDto<ChurchEventModel> {
  constructor(data: ChurchEventModel) {
    super(data);
  }
}
