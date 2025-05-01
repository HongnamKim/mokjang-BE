import { BaseDeleteResponseDto } from '../../../../../common/dto/reponse/base-delete-response.dto';

export class MinistryGroupDeleteResponseDto extends BaseDeleteResponseDto {
  constructor(timestamp: Date, id: number, name: string, success: boolean) {
    super(timestamp, id, success);
  }
}
