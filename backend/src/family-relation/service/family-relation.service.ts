import { Inject, Injectable } from '@nestjs/common';
import { QueryRunner } from 'typeorm';
import { MemberModel } from '../../members/entity/member.entity';
import {
  ICHURCHES_DOMAIN_SERVICE,
  IChurchesDomainService,
} from '../../churches/churches-domain/interface/churches-domain.service.interface';
import {
  IMEMBERS_DOMAIN_SERVICE,
  IMembersDomainService,
} from '../../members/member-domain/interface/members-domain.service.interface';
import {
  IFAMILY_RELATION_DOMAIN_SERVICE,
  IFamilyRelationDomainService,
} from '../family-relation-domain/service/interface/family-relation-domain.service.interface';
import { CreateFamilyRelationDto } from '../dto/create-family-relation.dto';
import { GetFamilyRelationListDto } from '../dto/get-family-relation-list.dto';
import { FamilyRelationCursorPaginationResultDto } from '../dto/family-relation-cursor-pagination-result.dto';
import { PatchFamilyRelationResponseDto } from '../dto/patch-family-relation-response.dto';
import { DeleteFamilyRelationResponseDto } from '../dto/delete-family-relation-response.dto';
import { ChurchUserModel } from '../../church-user/entity/church-user.entity';
import {
  IMEMBER_FILTER_SERVICE,
  IMemberFilterService,
} from '../../members/service/interface/member-filter.service.interface';
import { ChurchModel } from '../../churches/entity/church.entity';
import { PostFamilyRelationResponseDto } from '../dto/post-family-relation-response.dto';

@Injectable()
export class FamilyRelationService {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IMEMBERS_DOMAIN_SERVICE)
    private readonly membersDomainService: IMembersDomainService,
    @Inject(IFAMILY_RELATION_DOMAIN_SERVICE)
    private readonly familyDomainService: IFamilyRelationDomainService,

    @Inject(IMEMBER_FILTER_SERVICE)
    private readonly memberFilterService: IMemberFilterService,
  ) {}

  async getFamilyRelations(
    requestManager: ChurchUserModel,
    church: ChurchModel,
    memberId: number,
    dto: GetFamilyRelationListDto,
    qr?: QueryRunner,
  ) {
    const member = await this.membersDomainService.findMemberModelById(
      church,
      memberId,
      qr,
    );

    const result = await this.familyDomainService.findFamilyRelations(
      member,
      dto,
      qr,
    );

    const familyRelations = result.items;
    const familyMembers = familyRelations.map(
      (familyRelation) => familyRelation.familyMember,
    );

    const scopeGroupIds = await this.memberFilterService.getScopeGroupIds(
      church,
      requestManager,
    );

    const filteredFamilyMembers = this.memberFilterService.filterMembers(
      requestManager,
      familyMembers,
      scopeGroupIds,
    );

    familyRelations.forEach((familyRelation, index) => {
      familyRelation.familyMember = filteredFamilyMembers[index];
    });

    return new FamilyRelationCursorPaginationResultDto(
      result.items,
      result.items.length,
      result.nextCursor,
      result.hasMore,
    );
  }

  async createFamilyMember(
    requestManager: ChurchUserModel,
    church: ChurchModel,
    me: MemberModel,
    dto: CreateFamilyRelationDto,
    qr: QueryRunner,
  ) {
    const familyMember = await this.membersDomainService.findMemberModelById(
      church,
      dto.familyMemberId,
      qr,
    );

    await this.familyDomainService.createFamilyRelation(
      me,
      familyMember,
      dto.relation,
      qr,
    );

    const relation = await this.familyDomainService.findFamilyRelationById(
      me.id,
      familyMember.id,
      qr,
    );

    const scopeGroupIds = await this.memberFilterService.getScopeGroupIds(
      church,
      requestManager,
      qr,
    );

    relation.familyMember = this.memberFilterService.filterMember(
      requestManager,
      relation.familyMember,
      scopeGroupIds,
    );

    return new PostFamilyRelationResponseDto(relation);
  }

  async updateFamilyRelation(
    //churchId: number,
    //memberId: number,
    requestManager: ChurchUserModel,
    church: ChurchModel,
    me: MemberModel,
    familyMemberId: number,
    relation: string,
    qr: QueryRunner,
  ) {
    const targetRelation =
      await this.familyDomainService.findFamilyRelationModelById(
        me.id,
        familyMemberId,
        qr,
      );

    await this.familyDomainService.updateFamilyRelation(
      targetRelation,
      relation,
      qr,
    );

    const updatedRelation =
      await this.familyDomainService.findFamilyRelationById(
        me.id,
        familyMemberId,
        qr,
      );

    const familyMember = updatedRelation.familyMember;

    const scopeGroupIds = await this.memberFilterService.getScopeGroupIds(
      church,
      requestManager,
      qr,
    );

    updatedRelation.familyMember = this.memberFilterService.filterMember(
      requestManager,
      familyMember,
      scopeGroupIds,
    );

    return new PatchFamilyRelationResponseDto(updatedRelation);
  }

  async deleteFamilyRelation(
    me: MemberModel,
    familyMemberId: number,
    qr?: QueryRunner,
  ) {
    const familyRelation =
      await this.familyDomainService.findFamilyRelationModelById(
        me.id,
        familyMemberId,
        qr,
      );

    await this.familyDomainService.deleteFamilyRelation(familyRelation, qr);

    return new DeleteFamilyRelationResponseDto(
      new Date(),
      familyRelation.id,
      true,
    );
  }
}
