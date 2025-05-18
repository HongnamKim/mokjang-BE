import { BaseDeleteResponseDto } from '../../../../../common/dto/reponse/base-delete-response.dto';

export class DeleteSessionResponseDto extends BaseDeleteResponseDto {
  constructor(
    timestamp: Date,
    id: number,
    educationName: string,
    educationTerm: number,
    educationSession: number,
    sessionName: string,
    success: boolean,
  ) {
    super(timestamp, id, success);
  }
}
