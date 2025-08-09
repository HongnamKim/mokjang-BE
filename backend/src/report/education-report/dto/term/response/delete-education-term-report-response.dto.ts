import { BaseDeleteResponseDto } from '../../../../../common/dto/reponse/base-delete-response.dto';

export class DeleteEducationTermReportResponseDto extends BaseDeleteResponseDto {
  constructor(
    public readonly timestamp: Date,
    public readonly id: number,
    public readonly educationId: number,
    public readonly educationTermId: number,
    public readonly success: boolean,
  ) {
    super(timestamp, id, success);
  }
}
