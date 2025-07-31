import { BaseDeleteResponseDto } from '../../../../../common/dto/reponse/base-delete-response.dto';

export class DeleteMinistryGroupDetailHistoryResponseDto extends BaseDeleteResponseDto {
  constructor(timestamp: Date, id: number, success: boolean) {
    super(timestamp, id, success);
  }
}
