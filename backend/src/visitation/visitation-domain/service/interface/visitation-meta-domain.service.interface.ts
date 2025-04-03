import { ChurchModel } from '../../../../churches/entity/church.entity';
import { MemberModel } from '../../../../members/entity/member.entity';
import { CreateVisitationMetaDto } from '../../../dto/meta/create-visitation-meta.dto';
import { FindOptionsRelations, QueryRunner } from 'typeorm';
import { VisitationMetaModel } from '../../../entity/visitation-meta.entity';

export const IVISITATION_META_DOMAIN_SERVICE = Symbol(
  'IVISITATION_META_DOMAIN_SERVICE',
);

export interface IVisitationMetaDomainService {
  paginateVisitations(
    church: ChurchModel,
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
    qr?: QueryRunner,
  ): Promise<VisitationMetaModel>;

  updateVisitationMetaData(
    visitationMetaData: VisitationMetaModel,
    dto: any,
    qr?: QueryRunner,
  ): Promise<VisitationMetaModel>;
}
