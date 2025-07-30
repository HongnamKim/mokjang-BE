import { MemberModel } from '../entity/member.entity';
import { MemberDto } from './member.dto';

export class OfficerMemberDto extends MemberDto {
  public readonly officerStartDate: Date;

  constructor(member: MemberModel) {
    super(member);
    this.officerStartDate = member.officerHistory[0].startDate;
  }
}
