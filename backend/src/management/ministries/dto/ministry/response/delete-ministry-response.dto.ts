import { BaseDeleteResponseDto } from '../../../../../common/dto/reponse/base-delete-response.dto';

export class DeleteMinistryResponseDto extends BaseDeleteResponseDto {
  constructor(timestamp: Date, id: number, success: boolean) {
    super(timestamp, id, success);
  }
}
