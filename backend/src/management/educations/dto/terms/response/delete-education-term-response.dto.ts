import { BaseDeleteResponseDto } from '../../../../../common/dto/reponse/base-delete-response.dto';

export class DeleteEducationTermResponseDto extends BaseDeleteResponseDto {
  constructor(
    timestamp: Date,
    id: number,
    educationName: string,
    term: number,
    success: boolean,
  ) {
    super(timestamp, id, success);
  }
}
