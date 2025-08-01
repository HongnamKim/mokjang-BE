import { Inject, Injectable } from '@nestjs/common';
import {
  IVISITATION_DETAIL_DOMAIN_SERVICE,
  IVisitationDetailDomainService,
} from '../visitation-domain/interface/visitation-detail-domain.service.interface';
import { VisitationMetaModel } from '../entity/visitation-meta.entity';
import { MemberModel } from '../../members/entity/member.entity';
import { CreateVisitationDto } from '../dto/request/create-visitation.dto';
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

@Injectable()
export class VisitationDetailService {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    /*@Inject(IMEMBERS_DOMAIN_SERVICE)
    private readonly membersDomainService: IMembersDomainService,*/
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
    dto: UpdateVisitationDetailDto,
  ) {
    const church =
      await this.churchesDomainService.findChurchModelById(churchId);

    const metaData =
      await this.visitationMetaDomainService.findVisitationMetaModelById(
        church,
        visitationId,
      );

    const detailData =
      await this.visitationDetailDomainService.findVisitationDetailsByMeta(
        metaData,
      );

    await this.visitationDetailDomainService.updateVisitationDetail(
      detailData,
      dto,
    );

    if (dto.visitationPray) {
      detailData.visitationPray = dto.visitationPray;
    }

    if (dto.visitationContent) {
      detailData.visitationContent = dto.visitationContent;
    }

    return detailData;
  }

  /*async handleUpdateVisitationMembers(
    church: ChurchModel,
    visitationMeta: VisitationMetaModel,
    newMemberIds: number[],
    qr: QueryRunner,
  ) {
    const oldVisitationDetails =
      await this.visitationDetailDomainService.findVisitationDetailsByMeta(
        visitationMeta,
        qr,
      );

    // 기존 대상자 memberId
    const oldMemberIds = visitationMeta.members.map((m) => m.id); //oldVisitationDetails.map((detail) => detail.memberId);

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
  }*/
}
