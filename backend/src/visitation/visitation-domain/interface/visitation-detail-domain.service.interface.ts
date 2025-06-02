import { VisitationMetaModel } from '../../entity/visitation-meta.entity';
import { FindOptionsRelations, QueryRunner, UpdateResult } from 'typeorm';
import { VisitationDetailModel } from '../../entity/visitation-detail.entity';
import { MemberModel } from '../../../members/entity/member.entity';
import { UpdateVisitationDetailDto } from '../../dto/internal/detail/update-visitation-detail.dto';
import { VisitationDetailDto } from '../../dto/visittion-detail.dto';

export const IVISITATION_DETAIL_DOMAIN_SERVICE = Symbol(
  'IVISITATION_DETAIL_DOMAIN_SERVICE',
);

export interface IVisitationDetailDomainService {
  createAddedMemberDetails(
    metaData: VisitationMetaModel,
    //memberIds: number[],
    members: MemberModel[],
    qr: QueryRunner,
  ): Promise<void>;

  deleteRemovedMemberDetails(
    metaData: VisitationMetaModel,
    memberIds: number[],
    //members: MemberModel[],
    qr: QueryRunner,
  ): Promise<void>;

  createVisitationDetails(
    metaData: VisitationMetaModel,
    members: MemberModel[],
    dto: VisitationDetailDto[],
    qr: QueryRunner,
  ): Promise<VisitationDetailModel[]>;

  findVisitationDetailByMetaAndMemberId(
    metaData: VisitationMetaModel,
    member: MemberModel,
    qr?: QueryRunner,
  ): Promise<VisitationDetailModel>;

  findVisitationDetailsByMetaId(
    metaData: VisitationMetaModel,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<VisitationDetailModel>,
  ): Promise<VisitationDetailModel[]>;

  /*findVisitationDetailById(
    visitationMeta: VisitationMetaModel,
    visitationDetailId: number,
    qr?: QueryRunner,
  ): Promise<VisitationDetailModel>;*/

  updateVisitationDetail(
    visitationMeta: VisitationMetaModel,
    visitationDetail: VisitationDetailModel,
    dto: UpdateVisitationDetailDto,
    qr?: QueryRunner,
  ): Promise<UpdateResult>;

  deleteVisitationDetailsCascade(
    metaData: VisitationMetaModel,
    qr: QueryRunner,
  ): Promise<UpdateResult>;
}
