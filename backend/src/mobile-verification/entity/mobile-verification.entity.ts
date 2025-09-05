import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseModel } from '../../common/entity/base.entity';
import { UserModel } from '../../user/entity/user.entity';
import { VerificationType } from '../const/verification-type.enum';

@Entity()
@Index(['userId', 'createdAt'])
export class MobileVerificationModel extends BaseModel {
  @Index()
  @Column()
  userId: number;

  @ManyToOne(() => UserModel)
  @JoinColumn({ name: 'userId' })
  user: UserModel;

  @Column()
  verificationType: VerificationType;

  @Column({ nullable: true })
  mobilePhone: string;

  @Column()
  verificationCode: string;

  @Column({ default: 0 })
  attemptCount: number;

  @Index()
  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isVerified: boolean;
}
