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
import { MemberModel } from '../../../members/entity/member.entity';
import { ChurchModel } from '../../../entity/church.entity';
import { BaseModel } from '../../../../common/entity/base.entity';
import { OfficerHistoryModel } from '../../../members-management/entity/officer-history.entity';
import { ConflictException } from '@nestjs/common';

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
