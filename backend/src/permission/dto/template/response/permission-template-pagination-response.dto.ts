import { BaseOffsetPaginationResponseDto } from '../../../../common/dto/reponse/base-offset-pagination-response.dto';
import { PermissionTemplateModel } from '../../../entity/permission-template.entity';

export class PermissionTemplatePaginationResponseDto extends BaseOffsetPaginationResponseDto<PermissionTemplateModel> {
  constructor(
    data: PermissionTemplateModel[],
    totalCount: number,
    count: number,
    page: number,
    totalPage: number,
  ) {
    super(data, totalCount, count, page, totalPage);
  }
}
