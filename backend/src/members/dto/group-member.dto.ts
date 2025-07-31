import { MemberModel } from '../entity/member.entity';
import { MemberDto } from './member.dto';

export class GroupMemberDto extends MemberDto {
  public readonly groupStartDate: Date | null;
  public readonly groupLeaderStartDate: Date | null;

  constructor(member: MemberModel) {
    super(member);

    if (member.groupHistory[0]) {
      this.groupStartDate = member.groupHistory[0].startDate;

      this.groupLeaderStartDate = member.groupHistory[0].groupDetailHistory[0]
        ? member.groupHistory[0].groupDetailHistory[0].startDate
        : null;
    } else {
      this.groupStartDate = null;
      this.groupLeaderStartDate = null;
    }
  }
}
