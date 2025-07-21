import { MemberModel } from '../../../members/entity/member.entity';
import { MinistryModel } from '../../../management/ministries/entity/ministry.entity';
import { MinistryGroupHistoryModel } from '../entity/ministry-group-history.entity';

export class StartMinistryHistoryVo {
  member: MemberModel;
  ministry: MinistryModel;
  ministryGroupHistory: MinistryGroupHistoryModel;

  constructor(
    member: MemberModel,
    ministry: MinistryModel,
    ministryGroupHistory: MinistryGroupHistoryModel,
  ) {
    this.member = member;
    this.ministry = ministry;
    this.ministryGroupHistory = ministryGroupHistory;
  }
}
