import { LowAttendanceMemberDto } from '../low-attendance-member.dto';

export class GetLowWorshipAttendanceMembersResponseDto {
  constructor(
    public readonly data: LowAttendanceMemberDto[],
    public readonly timestamp: Date = new Date(),
  ) {}
}
