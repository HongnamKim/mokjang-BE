import {
  BeforeRemove,
  BeforeSoftRemove,
  Column,
  Entity,
  Index,
  ManyToMany,
  ManyToOne,
  OneToMany,
  Unique,
} from 'typeorm';
import { MemberModel } from '../../../members/entity/member.entity';
import { ChurchModel } from '../../../entity/church.entity';
import { MinistryGroupModel } from './ministry-group.entity';
import { BaseModel } from '../../../../common/entity/base.entity';
import { MinistryHistoryModel } from '../../../members-management/entity/ministry-history.entity';
import { ConflictException } from '@nestjs/common';

@Entity()
@Unique(['name', 'ministryGroupId'])
export class MinistryModel extends BaseModel {
  @Column({ length: 50, comment: '사역명' })
  name: string;

  @Column({ default: 0 })
  membersCount: number;

  @Index()
  @Column()
  churchId: number;

  @ManyToOne(() => ChurchModel, (church) => church.ministries)
  church: ChurchModel;

  @Column({ nullable: true })
  @Index()
  ministryGroupId: number | null;

  @ManyToOne(
    () => MinistryGroupModel,
    (ministryGroup) => ministryGroup.ministries,
  )
  ministryGroup: MinistryGroupModel;

  @ManyToMany(() => MemberModel, (member) => member.ministries)
  members: MemberModel[];

  @OneToMany(
    () => MinistryHistoryModel,
    (ministryHistory) => ministryHistory.ministry,
  )
  ministryHistory: MinistryModel[];

  @BeforeRemove()
  @BeforeSoftRemove()
  preventIfHasMember() {
    if (this.members.length > 0) {
      const memberNames = this.members.map((m) => m.name).join(', ');

      throw new ConflictException(
        `해당 사역을 가진 교인이 존재합니다.\n${memberNames}`,
      );
    }
  }
}
