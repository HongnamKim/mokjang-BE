import { BaseDeleteResponseDto } from '../../../../common/dto/reponse/base-delete-response.dto';

export class DeleteWorshipSessionResponseDto extends BaseDeleteResponseDto {
  constructor(
    public readonly timestamp: Date,
    public readonly id: number,
    //public readonly title: string,
    public readonly success: boolean,
  ) {
    super(timestamp, id, success);
  }
}
