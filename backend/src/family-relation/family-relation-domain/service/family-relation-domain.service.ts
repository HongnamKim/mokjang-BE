import { IFamilyRelationDomainService } from './interface/family-relation-domain.service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { FamilyRelationModel } from '../../entity/family-relation.entity';
import { FindOptionsRelations, IsNull, QueryRunner, Repository } from 'typeorm';
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { MemberModel } from '../../../members/entity/member.entity';
import { FamilyRelationException } from '../../const/exception/family-relation.exception';
import { Gender } from '../../../members/const/enum/gender.enum';
import {
  GenderBasedRelations,
  NeutralRelations,
} from '../const/family-relation.rules';
import { FamilyRelationConst } from '../const/family-relation.const';
import { FamilyRelation } from '../const/family-relation.interface';

@Injectable()
export class FamilyRelationDomainService
  implements IFamilyRelationDomainService
{
  constructor(
    @InjectRepository(FamilyRelationModel)
    private readonly familyRepository: Repository<FamilyRelationModel>,
  ) {}

  private getFamilyRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(FamilyRelationModel)
      : this.familyRepository;
  }

  async findFamilyRelations(member: MemberModel, qr?: QueryRunner) {
    const familyRepository = this.getFamilyRepository(qr);

    return familyRepository.find({
      where: {
        meId: member.id,
      },
      relations: { familyMember: true },
      order: {
        familyMember: {
          birth: 'asc',
        },
        familyMemberId: 'asc',
      },
    });
  }

  async findFamilyRelationModelById(
    meId: number,
    familyId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<FamilyRelationModel>,
  ) {
    const familyRepository = this.getFamilyRepository(qr);

    const relation = await familyRepository.findOne({
      where: {
        meId,
        familyMemberId: familyId,
      },
      relations: relationOptions,
    });

    if (!relation) {
      throw new NotFoundException(FamilyRelationException.NOT_FOUND);
    }

    return relation;
  }

  private async isExistFamilyRelation(
    me: MemberModel,
    family: MemberModel,
    qr?: QueryRunner,
  ) {
    const familyRepository = this.getFamilyRepository(qr);

    const isExist = await familyRepository.findOne({
      where: {
        meId: me.id,
        familyMemberId: family.id,
      },
    });

    return !!isExist;
  }

  private async findFamilyMemberIds(member: MemberModel, qr?: QueryRunner) {
    const familyRepository = this.getFamilyRepository(qr);

    const ids = (
      await familyRepository.find({
        where: {
          meId: member.id,
        },
        select: {
          familyMemberId: true,
        },
      })
    ).map((relation) => relation.familyMemberId);

    ids.push(member.id);

    return ids;
  }

  async fetchAndCreateFamilyRelations(
    me: MemberModel,
    newFamilyMember: MemberModel,
    relation: string,
    qr?: QueryRunner,
  ) {
    const familyRepository = this.getFamilyRepository(qr);

    const isExist = await this.isExistFamilyRelation(me, newFamilyMember, qr);

    if (isExist) {
      throw new ConflictException(FamilyRelationException.ALREADY_EXISTS);
    }

    const [newFamilyIds, myFamilyIds] = await Promise.all([
      this.findFamilyMemberIds(newFamilyMember, qr),
      this.findFamilyMemberIds(me, qr),
    ]);

    const familyRelations = this.buildFamilyRelations(
      me,
      newFamilyMember,
      myFamilyIds,
      newFamilyIds,
      relation,
    );
    /*let familyRelations: any[] = [];

    for (const newFamilyExistingFamilyMemberId of newFamilyIds) {
      for (const myFamilyMemberId of myFamilyIds) {
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
    }*/

    return familyRepository.save(familyRelations);
  }

  private buildFamilyRelations(
    me: MemberModel,
    newFamily: MemberModel,
    myFamilyIds: number[],
    newFamilyIds: number[],
    relation: string,
  ) {
    const relations: FamilyRelation[] = [];

    for (const newFamilyId of newFamilyIds) {
      for (const myFamilyId of myFamilyIds) {
        const isRelationFixed =
          myFamilyId === me.id && newFamilyId === newFamily.id;

        relations.push(
          {
            meId: myFamilyId,
            familyMemberId: newFamilyId,
            relation: isRelationFixed ? relation : FamilyRelationConst.FAMILY,
          },
          {
            meId: newFamilyId,
            familyMemberId: myFamilyId,
            relation: isRelationFixed
              ? this.getCounterRelation(relation, me)
              : FamilyRelationConst.FAMILY,
          },
        );
      }
    }

    return relations;
  }

  private getCounterRelation(relation: string, me: MemberModel) {
    if (NeutralRelations.has(relation)) {
      return relation;
    }

    if (GenderBasedRelations[relation]) {
      return me.gender === Gender.MALE
        ? GenderBasedRelations[relation][0]
        : GenderBasedRelations[relation][1];
    }

    return FamilyRelationConst.FAMILY;
  }

  async updateFamilyRelation(
    familyRelation: FamilyRelationModel,
    relation: string,
    qr?: QueryRunner,
  ) {
    const familyRepository = this.getFamilyRepository(qr);

    const result = await familyRepository.update(
      {
        meId: familyRelation.meId,
        familyMemberId: familyRelation.familyMemberId,
        deletedAt: IsNull(),
      },
      {
        relation,
      },
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(
        FamilyRelationException.UPDATE_ERROR,
      );
    }

    return this.findFamilyRelationModelById(
      familyRelation.meId,
      familyRelation.familyMemberId,
      qr,
    );
  }

  async deleteFamilyRelation(
    familyRelation: FamilyRelationModel,
    qr?: QueryRunner,
  ) {
    const familyRepository = this.getFamilyRepository(qr);

    const result = await familyRepository.softDelete({
      meId: familyRelation.meId,
      familyMemberId: familyRelation.familyMemberId,
      deletedAt: IsNull(),
    });

    if (result.affected === 0) {
      throw new InternalServerErrorException(
        FamilyRelationException.DELETE_ERROR,
      );
    }

    return `familyRelation me: ${familyRelation.meId}, family: ${familyRelation.familyMemberId} deleted`;
  }

  async createFamilyRelation(
    me: MemberModel,
    familyMember: MemberModel,
    relation: string,
    qr: QueryRunner,
  ) {
    const familyRepository = this.getFamilyRepository(qr);

    const isExistRelation = await this.isExistFamilyRelation(
      me,
      familyMember,
      qr,
    );

    if (isExistRelation) {
      throw new ConflictException(FamilyRelationException.ALREADY_EXISTS);
    }

    // 상대 가족은 나를 가족으로 생성했는지
    // 생성되어있으면 생략
    const isExistingCounterRelation = await this.isExistFamilyRelation(
      familyMember,
      me,
      qr,
    );

    const familyRelation: FamilyRelation[] = [];

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

    return this.findFamilyRelationModelById(me.id, familyMember.id, qr, {
      familyMember: true,
    });
  }

  async deleteAllFamilyRelations(deletedMember: MemberModel, qr: QueryRunner) {
    const familyRepository = this.getFamilyRepository(qr);

    return familyRepository
      .createQueryBuilder()
      .softDelete()
      .where('meId = :deletedId OR familyMemberId = :deletedId', {
        deletedId: deletedMember.id,
      })
      .execute();
  }
}
