import { BaseModel } from '../../common/entity/base.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { VisitationDetailModel } from './visitation-detail.entity';
import { UserModel } from '../../user/entity/user.entity';
import { VisitationMethod } from '../const/visitation-method.enum';
import { VisitationType } from '../const/visitation-type.enum';
import { ChurchModel } from '../../churches/entity/church.entity';

@Entity()
export class VisitationMetaModel extends BaseModel {
  @Index()
  @Column()
  churchId: number;

  @ManyToOne(() => ChurchModel, (church) => church.visitations)
  @JoinColumn({ name: 'churchId' })
  church: ChurchModel;

  @Column({ enum: VisitationMethod, comment: '심방 방식 (대면 / 비대면)' })
  visitationMethod: VisitationMethod;

  @Column({ enum: VisitationType, comment: '심방 종류 (개인 / 그룹)' })
  visitationType: VisitationType;

  @Index()
  @Column({ type: 'timestamptz', comment: '심방 일자' })
  visitationDate: Date;

  @Column({ length: 50, comment: '심방 제목' })
  visitationTitle: string;

  @Index()
  @Column({ comment: '심방 진행자 ID' })
  instructorId: number;

  @ManyToOne(() => UserModel)
  @JoinColumn({ name: 'instructorId' })
  instructor: UserModel;

  @OneToMany(
    () => VisitationDetailModel,
    (visitingDetail) => visitingDetail.visitationMeta,
  )
  visitationDetails: VisitationDetailModel[];
}
