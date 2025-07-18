import { SimpleMemberDto } from '../../members/dto/simple-member.dto';

export class LowAttendanceMemberDto {
  public readonly enrollmentId: number;
  public readonly total: number;
  public readonly presentCount: number;
  public readonly lastPresentDate: Date;
  public readonly attendanceRate: number;
  public readonly member: SimpleMemberDto;

  constructor(
    enrollmentId: number,
    total: number,
    presentCount: number,
    lastPresentDate: Date,
    attendanceRate: number,
    member: SimpleMemberDto,
  ) {
    this.enrollmentId = enrollmentId;
    this.total = total;
    this.presentCount = presentCount;
    this.lastPresentDate = lastPresentDate;
    this.attendanceRate = attendanceRate;
    this.member = member;
  }
}
