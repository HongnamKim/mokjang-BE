import { BaseDeleteResponseDto } from '../../../../common/dto/reponse/base-delete-response.dto';

export class DeleteEducationTermResponseDto extends BaseDeleteResponseDto {
  constructor(
    public readonly timestamp: Date,
    public readonly id: number,
    public readonly educationName: string,
    public readonly term: number,
    public readonly success: boolean,
  ) {
    super(timestamp, id, success);
  }
}
