import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FamilyModel } from '../entity/family.entity';
import { IsNull, QueryRunner, Repository } from 'typeorm';
import { MemberModel } from '../entity/member.entity';
import { GenderEnum } from '../const/enum/gender.enum';
import { FamilyRelation } from '../const/family-relation.const';
import { FamilyExceptionMessage } from '../exception-message/family-exception.message';

type FamilyRelation = {
  meId: number;
  familyMemberId: number;
  relation: string;
};

@Injectable()
export class FamilyService {
  constructor(
    @InjectRepository(FamilyModel)
    private readonly familyRepository: Repository<FamilyModel>,
  ) {}

  private getFamilyRepository(qr?: QueryRunner) {
    return qr ? qr.manager.getRepository(FamilyModel) : this.familyRepository;
  }

  async getFamilyMember(member: MemberModel, qr?: QueryRunner) {
    const familyRepository = this.getFamilyRepository(qr);

    return familyRepository.find({
      where: {
        meId: member.id,
      },
      relations: { familyMember: true },
      order: { familyMember: { birth: 'desc' }, familyMemberId: 'ASC' },
    });
  }

  private async isExistFamilyRelation(
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
  }

  private async getFamilyMemberIds(memberId: number, qr?: QueryRunner) {
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
  }

  async fetchAndCreateFamilyRelation(
    me: MemberModel,
    newFamilyMember: MemberModel,
    relation: string,
    qr?: QueryRunner,
  ) {
    const familyRepository = this.getFamilyRepository(qr);

    const isExist = await this.isExistFamilyRelation(me.id, newFamilyMember.id);

    if (isExist) {
      throw new BadRequestException(FamilyExceptionMessage.AlREADY_EXISTS);
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
            relation: isRelationFixed ? relation : FamilyRelation.FAMILY,
          },
          {
            meId: newFamilyExistingFamilyMemberId,
            familyMemberId: myFamilyMemberId,
            relation: isRelationFixed
              ? this.getCounterRelation(relation, me)
              : FamilyRelation.FAMILY,
          },
        );
      }
    }

    return familyRepository.save(familyRelations);
  }

  async updateFamilyRelation(
    me: MemberModel,
    family: MemberModel,
    relation: string,
    qr?: QueryRunner,
  ) {
    const familyRepository = this.getFamilyRepository(qr);

    const result = await familyRepository.update(
      {
        meId: me.id,
        familyMemberId: family.id,
        deletedAt: IsNull(),
      },
      { relation },
    );

    if (result.affected === 0) {
      throw new NotFoundException(FamilyExceptionMessage.NOT_FOUND);
    }

    return familyRepository.findOne({
      where: { meId: me.id, familyMemberId: family.id },
    });
  }

  async deleteFamilyRelation(
    me: MemberModel,
    family: MemberModel,
    qr?: QueryRunner,
  ) {
    const familyRepository = this.getFamilyRepository(qr);

    const result = await familyRepository.softDelete({
      meId: me.id,

      familyMemberId: family.id,
      deletedAt: IsNull(),
    });

    if (result.affected === 0) {
      throw new NotFoundException(FamilyExceptionMessage.NOT_FOUND);
    }

    return 'ok';
  }

  async createFamilyMember(
    me: MemberModel,
    familyMember: MemberModel,
    relation: string,
    qr: QueryRunner,
  ) {
    const familyRepository = this.getFamilyRepository(qr);

    const isExistRelation = await this.isExistFamilyRelation(
      me.id,
      familyMember.id,
      qr,
    );

    if (isExistRelation) {
      throw new BadRequestException(FamilyExceptionMessage.AlREADY_EXISTS);
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
    });
  }

  async testDelete(meId: number, familyMemberId: number) {
    return this.familyRepository.softDelete({
      meId: meId,
      familyMemberId: familyMemberId,
    });
  }

  /**
   * 가족 관계 soft delete - 복구 가능
   * @param deletedId
   * @param qr
   */
  async cascadeDeleteAllFamilyRelation(deletedId: number, qr: QueryRunner) {
    const familyRepository = this.getFamilyRepository(qr);

    const result = await familyRepository
      .createQueryBuilder()
      .softDelete()
      .where('meId = :deletedId OR familyMemberId = :deletedId', { deletedId })
      .execute();

    return result.affected;
  }

  /**
   * 가족 관계 완전 삭제 - 복구되지 않음
   * @param deletedId
   * @param qr
   */
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
  }

  private getCounterRelation(relation: string, me: MemberModel) {
    if (this.neutralRelations.has(relation)) {
      return relation;
    }

    if (this.genderBasedRelations[relation]) {
      return me.gender === GenderEnum.male
        ? this.genderBasedRelations[relation][0]
        : this.genderBasedRelations[relation][1];
    }

    return FamilyRelation.FAMILY;
  }

  private neutralRelations = new Set([
    FamilyRelation.BROTHER,
    FamilyRelation.SISTER,
    FamilyRelation.SIBLING,
    FamilyRelation.RELATIVE,
    FamilyRelation.FAMILY,
  ]);

  private genderBasedRelations = {
    [FamilyRelation.GRANDFATHER]: [
      FamilyRelation.GRANDSON,
      FamilyRelation.GRANDDAUGHTER,
    ],
    [FamilyRelation.GRANDMOTHER]: [
      FamilyRelation.GRANDSON,
      FamilyRelation.GRANDDAUGHTER,
    ],
    [FamilyRelation.GRANDSON]: [
      FamilyRelation.GRANDFATHER,
      FamilyRelation.GRANDMOTHER,
    ],
    [FamilyRelation.GRANDDAUGHTER]: [
      FamilyRelation.GRANDFATHER,
      FamilyRelation.GRANDMOTHER,
    ],
    [FamilyRelation.FATHER]: [FamilyRelation.SON, FamilyRelation.DAUGHTER],
    [FamilyRelation.MOTHER]: [FamilyRelation.SON, FamilyRelation.DAUGHTER],
    [FamilyRelation.SON]: [FamilyRelation.FATHER, FamilyRelation.MOTHER],
    [FamilyRelation.DAUGHTER]: [FamilyRelation.FATHER, FamilyRelation.MOTHER],
    [FamilyRelation.SON_IN_LAW]: [
      FamilyRelation.WIFE_FATHER_IN_LAW,
      FamilyRelation.WIFE_MOTHER_IN_LAW,
    ],
    [FamilyRelation.DAUGHTER_IN_LAW]: [
      FamilyRelation.HUSBAND_FATHER_IN_LAW,
      FamilyRelation.HUSBAND_MOTHER_IN_LAW,
    ],
    [FamilyRelation.HUSBAND_FATHER_IN_LAW]: FamilyRelation.DAUGHTER_IN_LAW,
    [FamilyRelation.HUSBAND_MOTHER_IN_LAW]: FamilyRelation.DAUGHTER_IN_LAW,
    [FamilyRelation.WIFE_FATHER_IN_LAW]: FamilyRelation.SON_IN_LAW,
    [FamilyRelation.WIFE_MOTHER_IN_LAW]: FamilyRelation.SON_IN_LAW,
  };

  /*switch (relation) {
      // 조부모 - 손자/손녀
      case FamilyRelation.GRANDFATHER:
      case FamilyRelation.GRANDMOTHER:
        return me.gender === GenderEnum.male
          ? FamilyRelation.GRANDSON
          : FamilyRelation.GRANDDAUGHTER;
      case FamilyRelation.GRANDSON:
      case FamilyRelation.GRANDDAUGHTER:
        return me.gender === GenderEnum.male
          ? FamilyRelation.GRANDFATHER
          : FamilyRelation.GRANDMOTHER;
      // 부모 - 자녀
      case FamilyRelation.MOTHER:
      case FamilyRelation.FATHER:
        return me.gender === GenderEnum.male
          ? FamilyRelation.SON
          : FamilyRelation.DAUGHTER;

      case FamilyRelation.SON:
      case FamilyRelation.DAUGHTER:
        return me.gender === GenderEnum.male
          ? FamilyRelation.FATHER
          : FamilyRelation.MOTHER;
      // 형제, 자매, 남매, 친인척, 가족
      case FamilyRelation.BROTHER:
      case FamilyRelation.SISTER:
      case FamilyRelation.SIBLING:
      case FamilyRelation.RELATIVE:
      case FamilyRelation.FAMILY:
        return relation;
      // 장인/장모 시부모 - 사위/며느리
      case FamilyRelation.SON_IN_LAW: // 사위 추가
        return me.gender === GenderEnum.male
          ? FamilyRelation.WIFE_FATHER_IN_LAW
          : FamilyRelation.WIFE_MOTHER_IN_LAW;
      case FamilyRelation.DAUGHTER_IN_LAW: // 며느리 추가
        return me.gender === GenderEnum.male
          ? FamilyRelation.HUSBAND_FATHER_IN_LAW
          : FamilyRelation.HUSBAND_MOTHER_IN_LAW;
      case FamilyRelation.HUSBAND_FATHER_IN_LAW: // 시부모 추가
      case FamilyRelation.HUSBAND_MOTHER_IN_LAW:
        return FamilyRelation.DAUGHTER_IN_LAW;
      case FamilyRelation.WIFE_FATHER_IN_LAW: // 장인 장모 추가
      case FamilyRelation.WIFE_MOTHER_IN_LAW:
        return FamilyRelation.SON_IN_LAW;
      default:
        return FamilyRelation.FAMILY;
    }*/
}
