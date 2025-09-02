import { BaseModel } from '../../common/entity/base.entity';
import { Check, Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { GroupModel } from '../../management/groups/entity/group.entity';
import { ChurchUserModel } from '../../church-user/entity/church-user.entity';

@Entity()
@Check(
  `("isAllGroups" = true AND "groupId" IS NULL) OR ("isAllGroups" = false AND "groupId" IS NOT NULL)`,
)
export class PermissionScopeModel extends BaseModel {
  @Index()
  @Column()
  churchUserId: number;

  @ManyToOne(
    () => ChurchUserModel,
    (churchUser) => churchUser.permissionScopes,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'churchUserId' })
  churchUser: ChurchUserModel;

  @Column({ default: false })
  isAllGroups: boolean;

  @Index()
  @Column({ nullable: true })
  groupId: number;

  @ManyToOne(() => GroupModel, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'groupId' })
  group: GroupModel;
}
