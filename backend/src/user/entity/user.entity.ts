import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { BaseModel } from '../../common/entity/base.entity';
import { ChurchModel } from '../../churches/entity/church.entity';
import { UserRole } from '../const/user-role.enum';
import { MemberModel } from '../../members/entity/member.entity';
import { ChurchJoinRequestModel } from '../../churches/entity/church-join-request.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class UserModel extends BaseModel {
  @Index()
  @Column()
  @Exclude()
  provider: string;

  @Column()
  @Exclude()
  providerId: string;

  @Column()
  name: string;

  @Column()
  mobilePhone: string;

  @Column({ default: false })
  mobilePhoneVerified: boolean;

  @Column({ default: false })
  privacyPolicyAgreed: boolean;

  @Index()
  @Column({ nullable: true })
  churchId: number;

  @ManyToOne(() => ChurchModel, (church) => church.users)
  @JoinColumn({ name: 'churchId' })
  church: ChurchModel;

  @Column({ enum: UserRole, default: UserRole.none })
  role: UserRole;

  @OneToMany(() => ChurchJoinRequestModel, (joinRequest) => joinRequest.user)
  joinRequest: ChurchJoinRequestModel;

  /*@Index()
  @Column({ nullable: true })
  memberId: number;*/

  @OneToOne(() => MemberModel, (member) => member.user)
  //@JoinColumn({ name: 'memberId' })
  member: MemberModel;
}
