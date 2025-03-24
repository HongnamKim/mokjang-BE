import { Column, Entity, Index, ManyToOne, OneToMany } from 'typeorm';
import { MinistryModel } from './ministry.entity';
import { BaseModel } from '../../../common/entity/base.entity';
import { ChurchModel } from '../../../churches/entity/church.entity';

@Entity()
export class MinistryGroupModel extends BaseModel {
  @Column({ length: 50, comment: '사역 그룹 이름' })
  name: string;

  @Column({ nullable: true })
  @Index()
  parentMinistryGroupId: number | null;

  @ManyToOne(
    () => MinistryGroupModel,
    (ministryGroup) => ministryGroup.childMinistryGroups,
  )
  parentMinistryGroup: MinistryGroupModel;

  @Column('int', { array: true, default: [], comment: '하위 그룹 ID 배열' })
  childMinistryGroupIds: number[];

  @OneToMany(
    () => MinistryGroupModel,
    (ministryGroup) => ministryGroup.parentMinistryGroup,
  )
  childMinistryGroups: MinistryGroupModel[];

  @Column()
  @Index()
  churchId: number;

  @ManyToOne(() => ChurchModel, (church) => church.ministryGroups)
  church: ChurchModel;

  @OneToMany(() => MinistryModel, (ministry) => ministry.ministryGroup)
  ministries: MinistryModel[];

  /*@BeforeRemove()
  @BeforeSoftRemove()
  preventIfHasChild() {
    if (this.childMinistryGroupIds.length > 0 || this.ministries.length > 0) {
      throw new ConflictException(
        '해당 사역 그룹에 속한 하위 사역 그룹 또는 사역이 존재합니다.',
      );
    }
  }*/
}
