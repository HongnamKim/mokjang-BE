import { BaseGetResponseDto } from '../../../../common/dto/reponse/base-get-response.dto';
import { ChurchEventModel } from '../../../entity/church-event.entity';

export class GetChurchEventResponseDto extends BaseGetResponseDto<
  ChurchEventModel | ChurchEventModel[]
> {
  constructor(data: ChurchEventModel | ChurchEventModel[]) {
    super(data);
  }
}
