import { BaseDomainOffsetPaginationResultDto } from '../../../../common/dto/base-domain-offset-pagination-result.dto';
import { GroupModel } from '../../entity/group.entity';

export class GroupDomainPaginationResultDto extends BaseDomainOffsetPaginationResultDto<GroupModel> {
  constructor(data: GroupModel[], totalCount: number) {
    super(data, totalCount);
  }
}
