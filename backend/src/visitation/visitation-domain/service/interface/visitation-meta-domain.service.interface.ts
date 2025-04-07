import { ChurchModel } from '../../../../churches/entity/church.entity';
import { MemberModel } from '../../../../members/entity/member.entity';
import { CreateVisitationMetaDto } from '../../../dto/meta/create-visitation-meta.dto';
import { FindOptionsRelations, QueryRunner, UpdateResult } from 'typeorm';
import { VisitationMetaModel } from '../../../entity/visitation-meta.entity';
import { GetVisitationDto } from '../../../dto/get-visitation.dto';

export const IVISITATION_META_DOMAIN_SERVICE = Symbol(
  'IVISITATION_META_DOMAIN_SERVICE',
);

export interface IVisitationMetaDomainService {
  paginateVisitations(
    church: ChurchModel,
    dto: GetVisitationDto,
  ): Promise<{ visitations: VisitationMetaModel[]; totalCount: number }>;

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
    instructor: MemberModel,
    dto: CreateVisitationMetaDto,
    members: MemberModel[],
    qr: QueryRunner,
  ): Promise<VisitationMetaModel>;

  updateVisitationMetaData(
    visitationMetaData: VisitationMetaModel,
    dto: any,
    qr?: QueryRunner,
  ): Promise<VisitationMetaModel>;

  deleteVisitationMeta(
    metaData: VisitationMetaModel,
    qr: QueryRunner,
  ): Promise<UpdateResult>;
}
