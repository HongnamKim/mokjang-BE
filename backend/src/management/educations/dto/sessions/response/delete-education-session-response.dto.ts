import { BaseDeleteResponseDto } from '../../../../../common/dto/reponse/base-delete-response.dto';

export class DeleteSessionResponseDto extends BaseDeleteResponseDto {
  constructor(
    public readonly timestamp: Date,
    public readonly id: number,
    public readonly educationName: string,
    public readonly educationTerm: number,
    public readonly educationSession: number,
    public readonly sessionName: string,
    public readonly success: boolean,
  ) {
    super(timestamp, id, success);
  }
}
