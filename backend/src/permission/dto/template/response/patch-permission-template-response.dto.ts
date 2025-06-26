import { BasePatchResponseDto } from '../../../../common/dto/reponse/base-patch-response.dto';
import { PermissionTemplateModel } from '../../../entity/permission-template.entity';

export class PatchPermissionTemplateResponseDto extends BasePatchResponseDto<PermissionTemplateModel> {
  constructor(data: PermissionTemplateModel) {
    super(data);
  }
}
