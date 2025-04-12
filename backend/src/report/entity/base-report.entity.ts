import { BaseModel } from '../../common/entity/base.entity';
import { MemberModel } from '../../members/entity/member.entity';
import { Column, Entity, ManyToOne, TableInheritance } from 'typeorm';

@Entity()
@TableInheritance({ column: { type: 'varchar', name: 'reportType' } })
export abstract class ReportModel extends BaseModel {
  @Column()
  senderId: number;

  @ManyToOne(() => MemberModel)
  sender: MemberModel;

  @Column()
  receiverId: number;

  @ManyToOne(() => MemberModel)
  receiver: MemberModel;

  @Column({ type: 'timestamp', default: new Date() })
  reportedAt: Date;

  @Column({ default: false })
  isRead: boolean;
}
