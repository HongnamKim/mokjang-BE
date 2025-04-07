import { VisitationMetaModel } from '../../../entity/visitation-meta.entity';
import { QueryRunner, UpdateResult } from 'typeorm';
import { VisitationDetailModel } from '../../../entity/visitation-detail.entity';
import { MemberModel } from '../../../../members/entity/member.entity';
import { VisitationDetailDto } from '../../../dto/visitation-detail.dto';

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

  findVisitationDetailsByMetaId(
    metaData: VisitationMetaModel,
    qr?: QueryRunner,
  ): Promise<VisitationDetailModel[]>;

  deleteVisitationDetailsCascade(
    metaData: VisitationMetaModel,
    qr: QueryRunner,
  ): Promise<UpdateResult>;
}
