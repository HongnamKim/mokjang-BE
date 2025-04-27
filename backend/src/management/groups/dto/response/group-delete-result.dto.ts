import { BaseDeleteResultDto } from '../../../../common/dto/reponse/base-delete-result.dto';

export class GroupDeleteResultDto extends BaseDeleteResultDto {
  constructor(
    public readonly timestamp: Date,
    public readonly id: number,
    public readonly name: string,
    public readonly success: boolean,
  ) {
    super(timestamp, id, success);
  }
}
