import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { BaseModel } from '../../../common/entity/base.entity';
import { GenderEnum } from '../enum/gender.enum';
import { ChurchModel } from '../../entity/church.entity';
import { IsString } from 'class-validator';

@Entity()
export class BelieverModel extends BaseModel {
  @Column()
  @IsString()
  name: string;

  @Column()
  mobilePhone: string;

  @Column({ nullable: true })
  birth: Date;

  @Column({ enum: GenderEnum, nullable: true })
  gender: GenderEnum;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  homePhone: string;

  // 가족 관계

  @Column({ nullable: true })
  occupation: string;

  @Column({ nullable: true })
  school: string;

  @Column({ nullable: true })
  marriage: string;

  @Column({ nullable: true })
  vehicleNumber: string;

  @Column()
  churchId: number;

  @ManyToOne(() => ChurchModel, (church) => church.believers)
  church: ChurchModel;

  // 내가 인도한 사람
  @OneToMany(() => BelieverModel, (believer) => believer.guidedBy)
  guiding: BelieverModel;

  // 나를 인도한 사람
  @ManyToOne(() => BelieverModel, (believer) => believer.guiding)
  guidedBy: BelieverModel;
}
