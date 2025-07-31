import { MinistryGroupDetailHistoryModel } from '../../entity/ministry-group-detail-history.entity';
import { MinistryHistoryModel } from '../../entity/child/ministry-history.entity';
import { MinistryGroupRoleHistoryModel } from '../../entity/child/ministry-group-role-history.entity';
import { MinistryDetailHistoryType } from '../../const/ministry-detail-history-type.enum';

export class MinistryGroupDetailHistoryDto {
  public readonly id: number;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
  public readonly type: MinistryDetailHistoryType;
  public readonly startDate: Date;
  public readonly endDate: Date | null;
  public readonly detail: DetailHistory;

  constructor(history: MinistryGroupDetailHistoryModel) {
    this.id = history.id;
    this.createdAt = history.createdAt;
    this.updatedAt = history.updatedAt;
    this.startDate = history.startDate;
    this.endDate = history.endDate;

    if (history instanceof MinistryHistoryModel) {
      this.type = MinistryDetailHistoryType.MINISTRY;

      if (!history.endDate && history.ministry) {
        this.detail = new MinistryDetail(
          history.ministryId,
          history.ministry.name,
        );
      } else {
        this.detail = new MinistryDetail(null, history.ministrySnapShot);
      }
    } else if (history instanceof MinistryGroupRoleHistoryModel) {
      this.type = MinistryDetailHistoryType.ROLE;
      this.detail = new RoleDetail(history.role);
    }
  }
}

class DetailHistory {}

class RoleDetail extends DetailHistory {
  public readonly role: string;

  constructor(role: string) {
    super();
    this.role = role;
  }
}

class MinistryDetail extends DetailHistory {
  public readonly ministryId: number | null;
  public readonly ministryName: string;

  constructor(ministryId: number | null, ministryName: string) {
    super();
    this.ministryId = ministryId;
    this.ministryName = ministryName;
  }
}
