import { BaseGetResponseDto } from '../../../../common/dto/reponse/base-get-response.dto';

export class GetMemberWorshipStatisticsResponseDto extends BaseGetResponseDto<any> {
  constructor(data: any) {
    super(data);
  }
}
