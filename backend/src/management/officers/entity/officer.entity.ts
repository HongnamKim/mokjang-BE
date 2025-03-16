import {
  BeforeRemove,
  BeforeSoftRemove,
  Column,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  Unique,
} from 'typeorm';
import { ConflictException } from '@nestjs/common';
import { BaseModel } from '../../../common/entity/base.entity';
import { ChurchModel } from '../../../churches/entity/church.entity';
import { MemberModel } from '../../../churches/members/entity/member.entity';
import { OfficerHistoryModel } from '../../../churches/members-management/entity/officer-history.entity';

@Entity()
@Unique(['name', 'churchId'])
export class OfficerModel extends BaseModel {
  @Index()
  @Column()
  churchId: number;

  @ManyToOne(() => ChurchModel, (church) => church.officers)
  church: ChurchModel;

  @Column({ length: 30, nullable: true })
  name: string;

  @Column({ default: 0 })
  membersCount: number;

  @OneToMany(() => MemberModel, (member) => member.officer)
  members: MemberModel[];

  @OneToMany(
    () => OfficerHistoryModel,
    (officerHistory) => officerHistory.officer,
  )
  history: OfficerHistoryModel[];

  @BeforeRemove()
  @BeforeSoftRemove()
  preventIfHasMember() {
    if (this.members.length > 0) {
      const memberNames = this.members.map((m) => m.name).join(', ');

      throw new ConflictException(
        `해당 직분을 갖고 있는 교인이 존재합니다.\n${memberNames}`,
      );
    }
  }
}
