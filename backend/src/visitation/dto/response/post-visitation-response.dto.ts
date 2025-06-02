import { BasePostResponseDto } from '../../../common/dto/reponse/base-post-response.dto';
import { VisitationMetaModel } from '../../entity/visitation-meta.entity';

export class PostVisitationResponseDto extends BasePostResponseDto<VisitationMetaModel> {
  constructor(data: VisitationMetaModel) {
    super(data);
  }
}
