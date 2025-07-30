import { MemberDto } from './member.dto';
import { MemberModel } from '../entity/member.entity';
import { MinistryGroupRoleHistoryModel } from '../../member-history/ministry-history/entity/child/ministry-group-role-history.entity';
import { MinistryHistoryModel } from '../../member-history/ministry-history/entity/child/ministry-history.entity';

export class MinistryMemberDto extends MemberDto {
  public readonly ministries: { id: number; name: string }[] | null;
  public readonly ministryGroupStartDate: Date | null;
  public ministryStartDate: Date | null;
  public ministryGroupLeaderStartDate: Date | null;

  constructor(member: MemberModel) {
    super(member);

    this.ministries =
      member.ministries.length > 0
        ? member.ministries //{ id: member.ministries[0].id, name: member.ministries[0].name }
        : null;

    if (member.ministryGroupHistory.length > 0) {
      this.ministryGroupStartDate = member.ministryGroupHistory[0].startDate;

      if (
        member.ministryGroupHistory[0].ministryGroupDetailHistory.length > 0
      ) {
        member.ministryGroupHistory[0].ministryGroupDetailHistory.forEach(
          (detail) => {
            if (detail instanceof MinistryGroupRoleHistoryModel) {
              this.ministryGroupLeaderStartDate = detail.startDate;
            }

            if (detail instanceof MinistryHistoryModel) {
              this.ministryStartDate = detail.startDate;
            }
          },
        );
      }

      if (!this.ministryStartDate) {
        this.ministryStartDate = null;
      }

      if (!this.ministryGroupLeaderStartDate) {
        this.ministryGroupLeaderStartDate = null;
      }
    }
  }
}
