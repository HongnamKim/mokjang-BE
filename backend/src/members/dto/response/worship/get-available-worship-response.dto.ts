import { BaseGetResponseDto } from '../../../../common/dto/reponse/base-get-response.dto';
import { WorshipModel } from '../../../../worship/entity/worship.entity';

export class GetAvailableWorshipResponseDto extends BaseGetResponseDto<
  WorshipModel[]
> {
  constructor(data: WorshipModel[]) {
    super(data);
  }
}
