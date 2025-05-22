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

@Injectable()
export class FamilyRelationService {
  constructor(
    @Inject(ICHURCHES_DOMAIN_SERVICE)
    private readonly churchesDomainService: IChurchesDomainService,
    @Inject(IMEMBERS_DOMAIN_SERVICE)
    private readonly membersDomainService: IMembersDomainService,
    @Inject(IFAMILY_RELATION_DOMAIN_SERVICE)
    private readonly familyDomainService: IFamilyRelationDomainService,
  ) {}

  async getFamilyRelations(
    churchId: number,
    memberId: number,
    qr?: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );
    const member = await this.membersDomainService.findMemberModelById(
      church,
      memberId,
      qr,
    );

    return this.familyDomainService.findFamilyRelations(member, qr);
  }

  async fetchAndCreateFamilyRelation(
    churchId: number,
    memberId: number,
    familyMemberId: number,
    relation: string,
    qr: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const [me, newFamilyMember] = await Promise.all([
      this.membersDomainService.findMemberModelById(church, memberId, qr, {}),
      this.membersDomainService.findMemberModelById(
        church,
        familyMemberId,
        qr,
        {},
      ),
    ]);
    return this.familyDomainService.fetchAndCreateFamilyRelations(
      me,
      newFamilyMember,
      relation,
      qr,
    );
  }

  async updateFamilyRelation(
    churchId: number,
    memberId: number,
    familyMemberId: number,
    relation: string,
    qr: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const [me, family] = await Promise.all([
      this.membersDomainService.findMemberModelById(church, memberId, qr, {}),
      this.membersDomainService.findMemberModelById(
        church,
        familyMemberId,
        qr,
        {},
      ),
    ]);

    const familyRelation =
      await this.familyDomainService.findFamilyRelationModelById(
        me.id,
        family.id,
        qr,
      );

    return this.familyDomainService.updateFamilyRelation(
      familyRelation,
      relation,
      qr,
    );
  }

  async deleteFamilyRelation(
    churchId: number,
    memberId: number,
    familyMemberId: number,
    qr?: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );

    const [me, family] = await Promise.all([
      this.membersDomainService.findMemberModelById(church, memberId, qr, {}),
      this.membersDomainService.findMemberModelById(
        church,
        familyMemberId,
        qr,
        {},
      ),
    ]);

    const familyRelation =
      await this.familyDomainService.findFamilyRelationModelById(
        me.id,
        family.id,
        qr,
      );

    return this.familyDomainService.deleteFamilyRelation(familyRelation, qr);
  }

  async createFamilyMember(
    churchId: number,
    memberId: number,
    dto: CreateFamilyRelationDto,
    qr: QueryRunner,
  ) {
    const church = await this.churchesDomainService.findChurchModelById(
      churchId,
      qr,
    );
    const [me, familyMember] = await Promise.all([
      this.membersDomainService.findMemberModelById(church, memberId, qr, {}),
      this.membersDomainService.findMemberModelById(
        church,
        dto.familyMemberId,
        qr,
        {},
      ),
    ]);

    return this.familyDomainService.createFamilyRelation(
      me,
      familyMember,
      dto.relation,
      qr,
    );
  }

  /**
   * 가족 관계 soft delete - 복구 가능
   * @param deletedMember
   * @param qr
   */
  async cascadeDeleteAllFamilyRelation(
    deletedMember: MemberModel,
    qr: QueryRunner,
  ) {
    return this.familyDomainService.deleteAllFamilyRelations(deletedMember, qr);
  }
}
