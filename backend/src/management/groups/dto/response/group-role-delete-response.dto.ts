import { BaseDeleteResponseDto } from '../../../../common/dto/reponse/base-delete-response.dto';

export class GroupRoleDeleteResponseDto extends BaseDeleteResponseDto {
  constructor(
    public readonly timestamp: Date,
    public readonly id: number,
    public readonly role: string,
    public readonly success: boolean,
  ) {
    super(timestamp, id, success);
  }
}
