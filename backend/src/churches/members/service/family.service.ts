import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FamilyModel } from '../entity/family.entity';
import { IsNull, QueryRunner, Repository } from 'typeorm';
import { MemberModel } from '../entity/member.entity';
import { GenderEnum } from '../../enum/gender.enum';
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
        deletedAt: IsNull(),
      },
    });

    return !!isExist;
  }

  private async getFamilyIds(memberId: number, qr?: QueryRunner) {
    const familyRepository = this.getFamilyRepository(qr);

    return (
      await familyRepository.find({
        where: {
          meId: memberId,
          deletedAt: IsNull(),
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

    const [newFamilyExistingFamilyIds, myFamilyIds] = await Promise.all([
      this.getFamilyIds(newFamilyMember.id, qr),
      this.getFamilyIds(me.id, qr),
    ]);
    newFamilyExistingFamilyIds.push(newFamilyMember.id);
    myFamilyIds.push(me.id);

    //const myFamilyIds = await this.getFamilyIds(me.id, qr);

    for (const newFamilyExistingFamilyId of newFamilyExistingFamilyIds) {
      for (const myFamilyId of myFamilyIds) {
        const isRelationFixed =
          myFamilyId === me.id &&
          newFamilyExistingFamilyId === newFamilyMember.id;

        await Promise.all([
          familyRepository.save({
            meId: myFamilyId,
            familyMemberId: newFamilyExistingFamilyId,
            relation: isRelationFixed ? relation : FamilyRelation.DEFAULT,
          }),
          familyRepository.save({
            meId: newFamilyExistingFamilyId,
            familyMemberId: myFamilyId,
            relation: isRelationFixed
              ? this.getCounterRelation(relation, me)
              : FamilyRelation.DEFAULT,
          }),
        ]);
      }
    }
  }

  async updateFamilyRelation(
    meId: number,
    familyMemberId: number,
    relation: string,
    qr?: QueryRunner,
  ) {
    const familyRepository = this.getFamilyRepository(qr);

    const result = await familyRepository.update(
      { meId: meId, familyMemberId: familyMemberId, deletedAt: IsNull() },
      { relation },
    );

    if (result.affected === 0) {
      throw new NotFoundException(FamilyExceptionMessage.NOT_FOUND);
    }

    return familyRepository.findOne({
      where: { meId: meId, familyMemberId: familyMemberId },
    });
  }

  async deleteFamilyRelation(
    meId: number,
    familyMemberId: number,
    qr?: QueryRunner,
  ) {
    const familyRepository = this.getFamilyRepository(qr);

    const result = await familyRepository.softDelete({
      meId,
      familyMemberId,
      deletedAt: IsNull(),
    });

    if (result.affected === 0) {
      throw new NotFoundException(FamilyExceptionMessage.NOT_FOUND);
    }

    return 'ok';
  }

  private async createFamilyMember(
    me: MemberModel,
    familyMember: MemberModel,
    relation: string,
    qr: QueryRunner,
  ) {
    const familyRepository = this.getFamilyRepository(qr);

    // soft delete 된 레코드를 포함하여 조회
    const existingRelation = await familyRepository.findOne({
      where: {
        meId: me.id,
        familyMemberId: familyMember.id,
      },
      withDeleted: true,
    });

    if (existingRelation) {
      if (!existingRelation.deletedAt) {
        throw new BadRequestException(FamilyExceptionMessage.AlREADY_EXISTS);
      }
      // soft delete된 레코드가 있으면 복구
      await familyRepository.restore({
        meId: me.id,
        familyMemberId: familyMember.id,
      });
      // 관계 업데이트
      await familyRepository.update(
        {
          meId: me.id,
          familyMemberId: familyMember.id,
        },
        { relation },
      );
    } else {
      // 레코드가 없으면 새로 생성
      await familyRepository.save({
        meId: me.id,
        familyMemberId: familyMember.id,
        relation,
      });
    }

    // 반대 방향의 관계도 같은 방식으로 처리
    const existingCounterRelation = await familyRepository.findOne({
      where: {
        meId: familyMember.id,
        familyMemberId: me.id,
      },
      withDeleted: true,
    });

    if (existingCounterRelation) {
      if (!existingCounterRelation.deletedAt) {
        // 이미 활성화된 반대 관계가 있으면 넘어감
      } else {
        // soft delete된 반대 관계가 있으면 복구 및 업데이트
        await familyRepository.restore({
          meId: familyMember.id,
          familyMemberId: me.id,
        });
        await familyRepository.update(
          {
            meId: familyMember.id,
            familyMemberId: me.id,
          },
          { relation: this.getCounterRelation(relation, me) },
        );
      }
    } else {
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
      case FamilyRelation.BROTHER:
      case FamilyRelation.SISTER:
      case FamilyRelation.남매:
      case FamilyRelation.DEFAULT:
        return relation;
      default:
        return '조카';
    }
  }
}
