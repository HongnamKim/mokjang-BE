import { Column, Entity, Index, OneToMany, OneToOne } from 'typeorm';
import { BaseModel } from '../../common/entity/base.entity';
import { ChurchModel } from '../../churches/entity/church.entity';
import { UserRole } from '../const/user-role.enum';
import { ChurchJoinRequestModel } from '../../churches/entity/church-join-request.entity';
import { Exclude } from 'class-transformer';
import { ChurchUserModel } from '../../church-user/entity/church-user.entity';

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

  @OneToOne(() => ChurchModel)
  ownedChurch: ChurchModel;

  @Column({
    default: UserRole.NONE,
    comment:
      '서비스 내의 role (owner: 교회 소유자, member: 교회 가입자, none: 소속X)',
  })
  role: UserRole;

  @OneToMany(() => ChurchUserModel, (churchUser) => churchUser.user)
  churchUser: ChurchUserModel[];

  @OneToMany(() => ChurchJoinRequestModel, (joinRequest) => joinRequest.user)
  joinRequest: ChurchJoinRequestModel;

  /*@OneToOne(() => MemberModel, (member) => member.user)
  member: MemberModel;*/
}
