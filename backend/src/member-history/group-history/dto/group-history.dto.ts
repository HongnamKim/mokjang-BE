import { GroupHistoryModel } from '../entity/group-history.entity';

export class GroupHistoryDto {
  public readonly id: number;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
  public readonly startDate: Date;
  public readonly endDate: Date | null;

  public readonly groupId: number | null;
  public readonly groupSnapShot: string;

  constructor(history: GroupHistoryModel) {
    this.id = history.id;
    this.createdAt = history.createdAt;
    this.updatedAt = history.updatedAt;
    this.startDate = history.startDate;
    this.endDate = history.endDate;
    this.groupId = history.groupId ? history.groupId : null;
    this.groupSnapShot = history.groupSnapShot;
  }
}
