import { Column, Entity, ManyToOne, Unique } from 'typeorm';
import { BaseModel } from '../../common/entity/base.entity';
import { ChurchModel } from '../../churches/entity/church.entity';

@Entity()
@Unique(['provider', 'providerId'])
export class UserModel extends BaseModel {
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
}