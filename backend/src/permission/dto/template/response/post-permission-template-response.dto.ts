import { BasePostResponseDto } from '../../../../common/dto/reponse/base-post-response.dto';
import { PermissionTemplateModel } from '../../../entity/permission-template.entity';

export class PostPermissionTemplateResponseDto extends BasePostResponseDto<PermissionTemplateModel> {
  constructor(data: PermissionTemplateModel) {
    super(data);
  }
}
