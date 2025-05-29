import { BaseModel } from '../../common/entity/base.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
} from 'typeorm';
import { ChurchModel } from '../../churches/entity/church.entity';
import { UserModel } from '../../user/entity/user.entity';
import { MemberModel } from '../../members/entity/member.entity';
import { ChurchUserRole } from '../../user/const/user-role.enum';
import { PermissionTemplateModel } from '../../permission/entity/permission-template.entity';
import { PermissionUnitModel } from '../../permission/entity/permission-unit.entity';

@Entity()
export class ChurchUserModel extends BaseModel {
  @Index()
  @Column()
  churchId: number;

  @ManyToOne(() => ChurchModel)
  @JoinColumn({ name: 'churchId' })
  church: ChurchModel;

  @Index()
  @Column()
  userId: number;

  @ManyToOne(() => UserModel)
  @JoinColumn({ name: 'userId' })
  user: UserModel;

  @Index()
  @Column({ nullable: true })
  memberId: number | null;

  @OneToOne(() => MemberModel, (member) => member.churchUser)
  @JoinColumn({ name: 'memberId' })
  member: MemberModel;

  @Index()
  @Column()
  role: ChurchUserRole;

  @Column({ nullable: true })
  permissionTemplateId: number | null;

  @ManyToOne(() => PermissionUnitModel)
  @JoinColumn({ name: 'permissionTemplateId' })
  permissionTemplate: PermissionTemplateModel;

  @Column({ default: false })
  isPermissionActive: boolean;

  @Index()
  @Column()
  joinedAt: Date;

  @Column({ nullable: true })
  leftAt: Date;
}
