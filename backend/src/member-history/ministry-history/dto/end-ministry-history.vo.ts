import { MinistryModel } from '../../../management/ministries/entity/ministry.entity';
import { MemberModel } from '../../../members/entity/member.entity';

export class EndMinistryHistoryVo {
  member: MemberModel;
  ministry: MinistryModel;

  constructor(member: MemberModel, ministry: MinistryModel) {
    this.member = member;
    this.ministry = ministry;
  }
}
