import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { BaseModel } from '../../../common/entity/base.entity';
import { GroupModel } from '../../settings/entity/group/group.entity';
import { MemberModel } from '../../members/entity/member.entity';
import { GroupRoleModel } from '../../settings/entity/group/group-role.entity';

@Entity()
export class GroupHistoryModel extends BaseModel {
  @Index()
  @Column()
  memberId: number;

  @ManyToOne(() => MemberModel, (member) => member.groupHistory)
  member: MemberModel;

  @Index()
  @Column({
    type: 'int',
    comment: '현재 그룹 ID (현재 그룹일 경우에만 값이 있음)',
    nullable: true,
  })
  groupId: number | null;

  @ManyToOne(() => GroupModel, (group) => group.history)
  group: GroupModel;

  @Index()
  @Column({
    type: 'int',
    comment: '현재 그룹 역할 ID (현재 그룹일 경우에만 값이 있음)',
    nullable: true,
  })
  groupRoleId: number | null;

  @ManyToOne(() => GroupRoleModel, (groupRole) => groupRole.history)
  groupRole: GroupRoleModel;

  @Column({
    comment: '그룹 종료일 시점의 그룹, 그룹 위계는 __ 로 구분',
    nullable: true,
  })
  groupSnapShot: string;

  @Column({
    type: 'varchar',
    comment: '그룹 종료일 시점의 그룹 내 역할',
    nullable: true,
  })
  groupRoleSnapShot: string | null;

  @Column({ type: 'timestamptz' })
  startDate: Date;

  @Column({ type: 'timestamptz', nullable: true })
  endDate: Date | null;
}
