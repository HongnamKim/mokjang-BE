import { PermissionUnitModel } from '../../entity/permission-unit.entity';

export class GetPermissionUnitResponseDto {
  constructor(
    public readonly data: PermissionUnitModel[],
    public readonly timestamp: Date = new Date(),
  ) {}
}
