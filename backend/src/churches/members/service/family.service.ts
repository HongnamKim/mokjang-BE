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

    //const myFamilyIds = await this.getFamilyIds(me.id, qr);

    for (const newFamilyExistingFamilyMemberId of newFamilyExistingFamilyMemberIds) {
      for (const myFamilyMemberId of myFamilyMemberIds) {
        const isRelationFixed =
          myFamilyMemberId === me.id &&
          newFamilyExistingFamilyMemberId === newFamilyMember.id;

        await Promise.all([
          familyRepository.save({
            meId: myFamilyMemberId,
            familyMemberId: newFamilyExistingFamilyMemberId,
            relation: isRelationFixed ? relation : FamilyRelation.FAMILY,
          }),
          familyRepository.save({
            meId: newFamilyExistingFamilyMemberId,
            familyMemberId: myFamilyMemberId,
            relation: isRelationFixed
              ? this.getCounterRelation(relation, me)
              : FamilyRelation.FAMILY,
          }),
        ]);
      }
    }
  }

  async updateFamilyRelation(
    churchId: number,
    me: MemberModel,
    family: MemberModel,
    relation: string,
    qr?: QueryRunner,
  ) {
    const familyRepository = this.getFamilyRepository(qr);

    const result = await familyRepository.update(
      {
        //me: { churchId },
        meId: me.id,
        //familyMember: { churchId },
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
    churchId: number,
    me: MemberModel,
    family: MemberModel,
    qr?: QueryRunner,
  ) {
    const familyRepository = this.getFamilyRepository(qr);

    const result = await familyRepository.softDelete({
      /*me: {
        churchId,
      },*/
      meId: me.id,
      /*familyMember: {
        churchId,
      },*/
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

    // 가족 관계 생성
    await familyRepository.save({
      meId: me.id,
      familyMemberId: familyMember.id,
      relation,
    });

    // 반대 관계가 이미 있으면 생성 생략
    // 없으면 새로 생성

    const isExistingCounterRelation = await this.isExistFamilyRelation(
      familyMember.id,
      me.id,
      qr,
    );

    if (!isExistingCounterRelation) {
      // 반대 관계가 없으면 새로 생성
      await familyRepository.save({
        meId: familyMember.id,
        familyMemberId: me.id,
        relation: this.getCounterRelation(relation, me),
      });
    }

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

  private getCounterRelation(relation: string, me: MemberModel) {
    switch (relation) {
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
    }
  }
}
