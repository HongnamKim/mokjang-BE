import { BaseGetResponseDto } from '../../../../common/dto/reponse/base-get-response.dto';
import { WorshipSessionModel } from '../../../entity/worship-session.entity';

export class GetWorshipSessionResponseDto extends BaseGetResponseDto<WorshipSessionModel> {
  constructor(data: WorshipSessionModel) {
    super(data);
  }
}
