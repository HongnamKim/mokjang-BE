import { ChurchModel } from '../../../churches/entity/church.entity';
import { MemberModel } from '../../../members/entity/member.entity';
import { CreateVisitationMetaDto } from '../../dto/internal/meta/create-visitation-meta.dto';
import { FindOptionsRelations, QueryRunner, UpdateResult } from 'typeorm';
import { VisitationMetaModel } from '../../entity/visitation-meta.entity';
import { GetVisitationDto } from '../../dto/request/get-visitation.dto';
import { UpdateVisitationMetaDto } from '../../dto/internal/meta/update-visitation-meta.dto';
import { MyScheduleStatusCountDto } from '../../../task/dto/my-schedule-status-count.dto';

export const IVISITATION_META_DOMAIN_SERVICE = Symbol(
  'IVISITATION_META_DOMAIN_SERVICE',
);

export interface IVisitationMetaDomainService {
  paginateVisitations(
    church: ChurchModel,
    dto: GetVisitationDto,
  ): Promise<VisitationMetaModel[]>;

  findVisitationMetaById(
    church: ChurchModel,
    visitationMetaId: number,
    qr?: QueryRunner,
  ): Promise<VisitationMetaModel>;

  findVisitationMetaModelById(
    church: ChurchModel,
    visitationMetaId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<VisitationMetaModel>,
  ): Promise<VisitationMetaModel>;

  createVisitationMetaData(
    church: ChurchModel,
    dto: CreateVisitationMetaDto,
    members: MemberModel[],
    qr: QueryRunner,
  ): Promise<VisitationMetaModel>;

  updateVisitationMetaData(
    visitationMetaData: VisitationMetaModel,
    dto: UpdateVisitationMetaDto,
    qr?: QueryRunner,
  ): Promise<UpdateResult>;

  updateVisitationMember(
    visitationMetaData: VisitationMetaModel,
    members: MemberModel[],
    qr: QueryRunner,
  ): Promise<VisitationMetaModel>;

  deleteVisitationMeta(
    metaData: VisitationMetaModel,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  countAllVisitations(church: ChurchModel, qr: QueryRunner): Promise<number>;

  findMyVisitations(
    me: MemberModel,
    from: Date,
    to: Date,
  ): Promise<VisitationMetaModel[]>;

  countMyVisitationStatus(
    me: MemberModel,
    from: Date,
    to: Date,
  ): Promise<MyScheduleStatusCountDto>;
}
