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
} from '../../members/member-domain/service/interface/members-domain.service.interface';
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
    /*const familyRepository = this.getFamilyRepository(qr);

    return familyRepository.find({
      where: {
        meId: member.id,
      },
      relations: { familyMember: true },
      order: { familyMember: { birth: 'desc' }, familyMemberId: 'ASC' },
    });*/
  }

  /*private async isExistFamilyRelation(
    meId: number,
    familyMemberId: number,
    qr?: QueryRunner,
  ) {
    const familyRepository = this.getFamilyRepository(qr);

    const isExist = await familyRepository.findOne({
      where: {
        meId,
        familyMemberId,
      },
    });

    return !!isExist;
  }*/

  /*private async getFamilyMemberIds(memberId: number, qr?: QueryRunner) {
    const familyRepository = this.getFamilyRepository(qr);

    return (
      await familyRepository.find({
        where: {
          meId: memberId,
        },
        select: {
          familyMemberId: true,
        },
      })
    ).map((relation) => relation.familyMemberId);
  }*/

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
    /*const familyRepository = this.getFamilyRepository(qr);

    const isExist = await this.isExistFamilyRelation(me.id, newFamilyMember.id);

    if (isExist) {
      throw new BadRequestException(FamilyException.ALREADY_EXISTS);
    }

    const [newFamilyExistingFamilyMemberIds, myFamilyMemberIds] =
      await Promise.all([
        this.getFamilyMemberIds(newFamilyMember.id, qr),
        this.getFamilyMemberIds(me.id, qr),
      ]);
    newFamilyExistingFamilyMemberIds.push(newFamilyMember.id);
    myFamilyMemberIds.push(me.id);

    let familyRelations: FamilyRelation[] = [];

    for (const newFamilyExistingFamilyMemberId of newFamilyExistingFamilyMemberIds) {
      for (const myFamilyMemberId of myFamilyMemberIds) {
        const isRelationFixed =
          myFamilyMemberId === me.id &&
          newFamilyExistingFamilyMemberId === newFamilyMember.id;

        familyRelations.push(
          {
            meId: myFamilyMemberId,
            familyMemberId: newFamilyExistingFamilyMemberId,
            relation: isRelationFixed ? relation : FamilyRelationConst.FAMILY,
          },
          {
            meId: newFamilyExistingFamilyMemberId,
            familyMemberId: myFamilyMemberId,
            relation: isRelationFixed
              ? this.getCounterRelation(relation, me)
              : FamilyRelationConst.FAMILY,
          },
        );
      }
    }

    return familyRepository.save(familyRelations);*/
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
    /*const familyRepository = this.getFamilyRepository(qr);

    const result = await familyRepository.update(
      {
        meId: me.id,
        familyMemberId: family.id,
        deletedAt: IsNull(),
      },
      { relation },
    );

    if (result.affected === 0) {
      throw new NotFoundException(FamilyException.NOT_FOUND);
    }

    return familyRepository.findOne({
      where: { meId: me.id, familyMemberId: family.id },
    });*/
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

    /*const familyRepository = this.getFamilyRepository(qr);

    const result = await familyRepository.softDelete({
      meId: me.id,

      familyMemberId: family.id,
      deletedAt: IsNull(),
    });

    if (result.affected === 0) {
      throw new NotFoundException(FamilyException.NOT_FOUND);
    }

    return 'ok';*/
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

    /*const familyRepository = this.getFamilyRepository(qr);

    const isExistRelation = await this.isExistFamilyRelation(
      me.id,
      familyMember.id,
      qr,
    );

    if (isExistRelation) {
      throw new BadRequestException(FamilyException.ALREADY_EXISTS);
    }

    // 반대 관계가 이미 있으면 생성 생략
    // 없으면 새로 생성
    const isExistingCounterRelation = await this.isExistFamilyRelation(
      familyMember.id,
      me.id,
      qr,
    );

    let familyRelation: FamilyRelation[] = [];

    familyRelation.push({
      meId: me.id,
      familyMemberId: familyMember.id,
      relation,
    });

    if (!isExistingCounterRelation) {
      familyRelation.push({
        meId: familyMember.id,
        familyMemberId: me.id,
        relation: this.getCounterRelation(relation, me),
      });
    }

    await familyRepository.save(familyRelation);

    return familyRepository.findOne({
      where: {
        meId: me.id,
        familyMemberId: familyMember.id,
      },
      relations: {
        familyMember: true,
      },
    });*/
  }

  /*async testDelete(meId: number, familyMemberId: number) {
    return this.familyRepository.softDelete({
      meId: meId,
      familyMemberId: familyMemberId,
    });
  }*/

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

    /*const familyRepository = this.getFamilyRepository(qr);

    const result = await familyRepository
      .createQueryBuilder()
      .softDelete()
      .where('meId = :deletedId OR familyMemberId = :deletedId', {
        deletedId: deletedMember.id,
      })
      .execute();

    return result.affected;*/
  }

  /*
  async cascadeRemoveAllFamilyRelations(deletedId: number, qr: QueryRunner) {
    const familyRepository = this.getFamilyRepository(qr);

    const deleteTargets = await familyRepository.find({
      where: [
        {
          meId: deletedId,
        },
        {
          familyMemberId: deletedId,
        },
      ],
    });

    return familyRepository.remove(deleteTargets);
  }*/
}
