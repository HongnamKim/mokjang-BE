import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { ChurchModel } from '../../entity/church.entity';
import { BaseModel } from '../../../common/entity/base.entity';

@Entity()
export class RequestInfoModel extends BaseModel {
  @Column()
  @Index()
  requestedChurchId: number;

  @Column()
  @Index()
  believerId: number;

  @Column()
  @Index()
  name: string;

  @Column()
  @Index()
  mobilePhone: string;

  @Column({ nullable: true })
  guideId?: number;

  @Column({ nullable: true })
  familyId?: number;

  @Column({ default: 1 })
  requestInfoAttempts: number;

  @Column({ default: 0 })
  validateAttempts: number;

  @Column({ nullable: true, type: 'timestamptz' })
  requestInfoExpiresAt: Date;

  @Column({ default: false })
  isValidated: boolean;

  @ManyToOne(() => ChurchModel, (church) => church.requestInfos)
  requestedChurch: ChurchModel;
}
