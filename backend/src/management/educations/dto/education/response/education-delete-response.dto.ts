import { BaseDeleteResponseDto } from '../../../../../common/dto/reponse/base-delete-response.dto';

export class EducationDeleteResponseDto extends BaseDeleteResponseDto {
  constructor(
    public readonly timestamp: Date,
    public readonly id: number,
    public readonly name: string,
    public readonly success: boolean,
  ) {
    super(timestamp, id, success);
  }
}
