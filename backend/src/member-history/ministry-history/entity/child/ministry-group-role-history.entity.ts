import { MinistryGroupDetailHistoryModel } from '../ministry-group-detail-history.entity';
import { ChildEntity, Column } from 'typeorm';
import { GroupRole } from '../../../../management/groups/const/group-role.enum';

@ChildEntity('role')
export class MinistryGroupRoleHistoryModel extends MinistryGroupDetailHistoryModel {
  @Column({ nullable: true })
  role: GroupRole;
}
