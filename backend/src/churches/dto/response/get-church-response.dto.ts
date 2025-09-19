import { BaseGetResponseDto } from '../../../common/dto/reponse/base-get-response.dto';
import { ChurchModel } from '../../entity/church.entity';

export class GetChurchResponseDto extends BaseGetResponseDto<ChurchModel> {
  constructor(data: ChurchModel) {
    super(data);
  }
}
