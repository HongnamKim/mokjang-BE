import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  Unique,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { BaseModel } from '../../common/entity/base.entity';
import { ChurchModel } from '../../churches/entity/church.entity';
import { MemberModel } from '../../members/entity/member.entity';

@Entity()
@Unique(['churchId', 'name', 'mobilePhone'])
export class RequestInfoModel extends BaseModel {
  @Column()
  @Index()
  @Exclude()
  churchId: number;

  @ManyToOne(() => ChurchModel, (church) => church.requestInfos)
  @JoinColumn({ name: 'churchId' })
  church: ChurchModel;

  @Column()
  @Index()
  @Exclude()
  memberId: number;

  @OneToOne(() => MemberModel, (member) => member.requestInfo)
  @JoinColumn({ name: 'memberId' })
  member: MemberModel;

  @Column({ length: 30, comment: '교인 이름' })
  @Index()
  name: string;

  @Column({ length: 15, comment: '휴대폰 전화 번호' })
  @Index()
  mobilePhone: string;

  @Column({ default: 1, comment: '정보 요청 문자 전송 횟수' })
  requestInfoAttempts: number;

  @Column({ default: 0, comment: '정보 입력 시도 횟수' })
  validateAttempts: number;

  @Column({
    nullable: true,
    type: 'timestamptz',
    comment: '정보 입력 유효 날짜',
  })
  requestInfoExpiresAt: Date;

  @Column({ default: false })
  isValidated: boolean;
}
