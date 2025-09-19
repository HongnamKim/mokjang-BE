import { BasePatchResponseDto } from '../../../common/dto/reponse/base-patch-response.dto';
import { VisitationMetaModel } from '../../entity/visitation-meta.entity';

export class PatchVisitationResponseDto extends BasePatchResponseDto<VisitationMetaModel> {
  constructor(data: VisitationMetaModel) {
    super(data);
  }
}
