import { Inject, Injectable } from '@nestjs/common';
import {
  IVISITATION_DETAIL_DOMAIN_SERVICE,
  IVisitationDetailDomainService,
} from '../visitation-domain/interface/visitation-detail-domain.service.interface';
import { VisitationMetaModel } from '../entity/visitation-meta.entity';
import { MemberModel } from '../../members/entity/member.entity';
import { CreateVisitationDto } from '../dto/create-visitation.dto';
import { QueryRunner } from 'typeorm';
import {
  IVISITATION_META_DOMAIN_SERVICE,
  IVisitationMetaDomainService,
} from '../visitation-domain/interface/visitation-meta-domain.service.interface';
import { UpdateVisitationDetailDto } from '../dto/internal/detail/update-visitation-detail.dto';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../churches/churches-domain/interface/churches-domain.service.interface';
import {
  IMEMBERS_DOMAIN_SERVICE,
  IMembersDomainService,
} from '../../members/member-domain/interface/members-domain.service.interface';
import { ChurchModel } from '../../churches/entity/church.entity';

@Injectable()
export class VisitationDetailService {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IMEMBERS_DOMAIN_SERVICE)
    private readonly membersDomainService: IMembersDomainService,
    @Inject(IVISITATION_META_DOMAIN_SERVICE)
    private readonly visitationMetaDomainService: IVisitationMetaDomainService,
    @Inject(IVISITATION_DETAIL_DOMAIN_SERVICE)
    private readonly visitationDetailDomainService: IVisitationDetailDomainService,
  ) {}

  createVisitationDetails(
    visitationMeta: VisitationMetaModel,
    members: MemberModel[],
    dto: CreateVisitationDto,
    qr: QueryRunner,
  ) {
    return this.visitationDetailDomainService.createVisitationDetails(
      visitationMeta,
      members,
      dto.visitationDetails,
      qr,
    );
  }

  async updateVisitationDetail(
    churchId: number,
    visitationId: number,
    memberId: number,
    dto: UpdateVisitationDetailDto,
  ) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);

    const [metaData, member] = await Promise.all([
      this.visitationMetaDomainService.findVisitationMetaModelById(
        church,
        visitationId,
      ),
      this.membersDomainService.findMemberModelById(church, memberId),
    ]);

    const detailData =
      await this.visitationDetailDomainService.findVisitationDetailByMetaAndMemberId(
        metaData,
        member,
      );

    await this.visitationDetailDomainService.updateVisitationDetail(
      metaData,
      detailData,
      dto,
    );

    return this.visitationDetailDomainService.findVisitationDetailByMetaAndMemberId(
      metaData,
      member,
    );
  }

  async handleUpdateVisitationMembers(
    church: ChurchModel,
    visitationMeta: VisitationMetaModel,
    newMemberIds: number[],
    qr: QueryRunner,
  ) {
    const oldVisitationDetails =
      await this.visitationDetailDomainService.findVisitationDetailsByMetaId(
        visitationMeta,
        qr,
      );

    // 기존 대상자 memberId
    const oldMemberIds = oldVisitationDetails.map((detail) => detail.memberId);

    // 삭제될 detail 의 memberId
    const newMemberIdsSet = new Set(newMemberIds);
    const removedMemberIds = oldMemberIds.filter(
      (oldMemberId) => !newMemberIdsSet.has(oldMemberId),
    );

    // 새로 생성될 detail 의 memberId
    const oldMemberIdsSet = new Set(oldMemberIds);
    const addedMemberIds = newMemberIds.filter(
      (newMemberId) => !oldMemberIdsSet.has(newMemberId),
    );

    await this.visitationDetailDomainService.deleteRemovedMemberDetails(
      visitationMeta,
      removedMemberIds,
      qr,
    );

    const addedMembers = await this.membersDomainService.findMembersById(
      church,
      addedMemberIds,
      qr,
    );

    await this.visitationDetailDomainService.createAddedMemberDetails(
      visitationMeta,
      addedMembers,
      qr,
    );
  }
}
