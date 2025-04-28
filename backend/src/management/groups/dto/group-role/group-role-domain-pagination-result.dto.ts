import { GroupRoleModel } from '../../entity/group-role.entity';
import { BaseDomainOffsetPaginationResultDto } from '../../../../common/dto/base-domain-offset-pagination-result.dto';

export class GroupRoleDomainPaginationResultDto extends BaseDomainOffsetPaginationResultDto<GroupRoleModel> {
  constructor(
    public readonly data: GroupRoleModel[],
    public readonly totalCount: number,
  ) {
    super(data, totalCount);
  }
}
