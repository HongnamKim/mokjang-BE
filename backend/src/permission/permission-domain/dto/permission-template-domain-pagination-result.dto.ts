import { BaseDomainOffsetPaginationResultDto } from '../../../common/dto/base-domain-offset-pagination-result.dto';
import { PermissionTemplateModel } from '../../entity/permission-template.entity';

export class PermissionTemplateDomainPaginationResultDto extends BaseDomainOffsetPaginationResultDto<PermissionTemplateModel> {
  constructor(data: PermissionTemplateModel[], totalCount: number) {
    super(data, totalCount);
  }
}
