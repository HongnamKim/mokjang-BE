import { BaseModel } from '../../common/entity/base.entity';
import { MemberModel } from '../../members/entity/member.entity';
import { Column, Entity, Index, ManyToOne, TableInheritance } from 'typeorm';

@Entity()
@TableInheritance({ column: { type: 'varchar', name: 'reportType' } })
export abstract class ReportModel extends BaseModel {
  @Index()
  @Column()
  senderId: number;

  @ManyToOne(() => MemberModel)
  sender: MemberModel;

  @Index()
  @Column()
  receiverId: number;

  @ManyToOne(() => MemberModel)
  receiver: MemberModel;

  @Column({ type: 'timestamp', default: new Date() })
  reportedAt: Date;

  @Column({ default: false })
  isRead: boolean;

  @Column({ default: false })
  isConfirmed: boolean;
}
