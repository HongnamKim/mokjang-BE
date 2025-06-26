import { BasePostResponseDto } from '../../../../common/dto/reponse/base-post-response.dto';
import { WorshipAttendanceModel } from '../../../entity/worship-attendance.entity';

export class PostWorshipAttendanceResponseDto extends BasePostResponseDto<WorshipAttendanceModel> {
  constructor(data: WorshipAttendanceModel) {
    super(data);
  }
}
