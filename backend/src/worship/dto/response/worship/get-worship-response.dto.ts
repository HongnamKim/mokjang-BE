import { BaseGetResponseDto } from '../../../../common/dto/reponse/base-get-response.dto';
import { WorshipModel } from '../../../entity/worship.entity';

export class GetWorshipResponseDto extends BaseGetResponseDto<WorshipModel> {
  constructor(data: WorshipModel) {
    super(data);
  }
}
