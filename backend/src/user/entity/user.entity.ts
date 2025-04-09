import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
} from 'typeorm';
import { BaseModel } from '../../common/entity/base.entity';
import { ChurchModel } from '../../churches/entity/church.entity';
import { UserRole } from '../const/user-role.enum';
import { MemberModel } from '../../members/entity/member.entity';

@Entity()
export class UserModel extends BaseModel {
  @Index()
  @Column()
  provider: string;

  @Column()
  providerId: string;

  @Column()
  name: string;

  @Column()
  mobilePhone: string;

  @Column({ default: false })
  mobilePhoneVerified: boolean;

  @Column({ default: false })
  privacyPolicyAgreed: boolean;

  @ManyToOne(() => ChurchModel, (church) => church.users)
  church: ChurchModel;

  @Column({ enum: UserRole, default: UserRole.none })
  role: UserRole;

  @Column({ nullable: true })
  memberId: number;

  @OneToOne(() => MemberModel, (member) => member.user)
  @JoinColumn({ name: 'memberId' })
  member: MemberModel;
}
