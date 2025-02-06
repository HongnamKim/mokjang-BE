import { Column, Entity, Index, ManyToOne, OneToOne } from 'typeorm';
import { BaseModel } from '../../common/entity/base.entity';
import { ChurchModel } from '../../churches/entity/church.entity';

@Entity()
//@Unique(['provider', 'providerId'])
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

  @OneToOne(() => ChurchModel, (church) => church.mainAdmin)
  adminChurch: ChurchModel;

  @ManyToOne(() => ChurchModel, (church) => church.subAdmins)
  managingChurch: ChurchModel;
}
