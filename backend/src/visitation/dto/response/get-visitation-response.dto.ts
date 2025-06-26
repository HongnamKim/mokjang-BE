import { BaseGetResponseDto } from '../../../common/dto/reponse/base-get-response.dto';
import { VisitationMetaModel } from '../../entity/visitation-meta.entity';

export class GetVisitationResponseDto extends BaseGetResponseDto<VisitationMetaModel> {
  constructor(data: VisitationMetaModel) {
    super(data);
  }
}
