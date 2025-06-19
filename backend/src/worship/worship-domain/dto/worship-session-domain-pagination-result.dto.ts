import { BaseDomainOffsetPaginationResultDto } from '../../../common/dto/base-domain-offset-pagination-result.dto';
import { WorshipSessionModel } from '../../entity/worship-session.entity';

export class WorshipSessionDomainPaginationResultDto extends BaseDomainOffsetPaginationResultDto<WorshipSessionModel> {
  constructor(data: WorshipSessionModel[], totalCount: number) {
    super(data, totalCount);
  }
}
