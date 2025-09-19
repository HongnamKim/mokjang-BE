import { PermissionTemplateModel } from '../../../entity/permission-template.entity';

export class PermissionTemplatePaginationResponseDto {
  constructor(
    public readonly data: PermissionTemplateModel[],
    public readonly timestamp: Date = new Date(),
  ) {}
}
