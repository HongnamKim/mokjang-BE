import { BaseGetResponseDto } from '../../../../common/dto/reponse/base-get-response.dto';
import { PermissionTemplateModel } from '../../../entity/permission-template.entity';

export class GetPermissionTemplateResponseDto extends BaseGetResponseDto<PermissionTemplateModel> {
  constructor(data: PermissionTemplateModel) {
    super(data);
  }
}
