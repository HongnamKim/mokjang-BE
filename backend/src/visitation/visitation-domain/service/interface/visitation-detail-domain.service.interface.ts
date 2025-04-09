import { VisitationMetaModel } from '../../../entity/visitation-meta.entity';
import { QueryRunner, UpdateResult } from 'typeorm';
import { VisitationDetailModel } from '../../../entity/visitation-detail.entity';
import { MemberModel } from '../../../../members/entity/member.entity';
import { VisitationDetailDto } from '../../../dto/visitation-detail.dto';
import { UpdateVisitationDetailDto } from '../../../dto/detail/update-visitation-detail.dto';

export const IVISITATION_DETAIL_DOMAIN_SERVICE = Symbol(
  'IVISITATION_DETAIL_DOMAIN_SERVICE',
);

export interface IVisitationDetailDomainService {
  createVisitationDetail(
    metaData: VisitationMetaModel,
    memberModel: MemberModel,
    dto: VisitationDetailDto,
    qr: QueryRunner,
  ): Promise<VisitationDetailModel>;

  findVisitationDetailByMetaAndMemberId(
    metaData: VisitationMetaModel,
    member: MemberModel,
    qr?: QueryRunner,
  ): Promise<VisitationDetailModel>;

  findVisitationDetailsByMetaId(
    metaData: VisitationMetaModel,
    qr?: QueryRunner,
  ): Promise<VisitationDetailModel[]>;

  findVisitationDetailById(
    visitationMeta: VisitationMetaModel,
    visitationDetailId: number,
    qr?: QueryRunner,
  ): Promise<VisitationDetailModel>;

  findVisitationDetailModelById(
    visitationMeta: VisitationMetaModel,
    visitationDetailId: number,
    qr?: QueryRunner,
  ): Promise<VisitationDetailModel>;

  updateVisitationDetail(
    visitationMeta: VisitationMetaModel,
    visitationDetail: VisitationDetailModel,
    dto: UpdateVisitationDetailDto,
    qr?: QueryRunner,
  ): Promise<VisitationDetailModel>;

  deleteVisitationDetailsCascade(
    metaData: VisitationMetaModel,
    qr: QueryRunner,
  ): Promise<UpdateResult>;

  deleteVisitationDetail(
    visitationDetail: VisitationDetailModel,
    qr?: QueryRunner,
  ): Promise<UpdateResult>;
}
