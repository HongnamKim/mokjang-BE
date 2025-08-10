import { BasePatchResponseDto } from '../../../../common/dto/reponse/base-patch-response.dto';
import { SessionAttendanceModel } from '../../entity/session-attendance.entity';

export class PatchSessionAttendanceResponseDto extends BasePatchResponseDto<SessionAttendanceModel> {
  constructor(data: SessionAttendanceModel) {
    super(data);
  }
}
