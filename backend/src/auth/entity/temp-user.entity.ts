import { BaseModel } from '../../common/entity/base.entity';
import { Column, Entity, Index } from 'typeorm';

@Entity()
export class TempUserModel extends BaseModel {
  @Index()
  @Column()
  provider: string;

  @Column()
  providerId: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  mobilePhone: string;

  @Column({ default: 0 })
  requestAttempts: number;

  @Column({ nullable: true, type: 'timestamptz' })
  requestedAt: Date;

  @Column({ nullable: true })
  verificationCode: string;

  @Column({ nullable: true, type: 'timestamptz' })
  codeExpiresAt: Date;

  @Column({ default: 0 })
  verificationAttempts: number;

  @Column({ default: false })
  isVerified: boolean;
}
