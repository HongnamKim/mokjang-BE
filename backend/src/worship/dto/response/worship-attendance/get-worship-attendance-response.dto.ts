import { BaseGetResponseDto } from '../../../../common/dto/reponse/base-get-response.dto';
import { WorshipAttendanceModel } from '../../../entity/worship-attendance.entity';

export class GetWorshipAttendanceResponseDto extends BaseGetResponseDto<WorshipAttendanceModel> {
  constructor(data: WorshipAttendanceModel) {
    super(data);
  }
}
