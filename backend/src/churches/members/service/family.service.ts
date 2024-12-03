import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FamilyModel } from '../entity/family.entity';
import { IsNull, QueryRunner, Repository } from 'typeorm';
import { MemberModel } from '../entity/member.entity';
import { MembersService } from './members.service';
import { CreateFamilyDto } from '../dto/family/create-family.dto';
import { GenderEnum } from '../../enum/gender.enum';
import { FamilyRelation } from '../const/family-relation.const';
import { FamilyExceptionMessage } from '../exception-message/family-exception.message';

@Injectable()
export class FamilyService {
  constructor(
    @InjectRepository(FamilyModel)
    private readonly familyRepository: Repository<FamilyModel>,
    private readonly membersService: MembersService,
  ) {}

  private getFamilyRepository(qr?: QueryRunner) {
    return qr ? qr.manager.getRepository(FamilyModel) : this.familyRepository;
  }

  async getFamilyMember(churchId: number, memberId: number) {
    const isExist = await this.membersService.isExistMemberById(
      churchId,
      memberId,
    );

    if (!isExist) {
      throw new NotFoundException('해당 교인을 찾을 수 없습니다.');
    }

    return this.familyRepository.find({
      where: { meId: memberId },
      relations: { familyMember: true },
    });
  }

  async fetchFamilyRelation(
    churchId: number,
    memberId: number,
    familyId: number,
    relation: string,
    qr?: QueryRunner,
  ) {
    const [member, family] = await Promise.all([
      this.membersService.getMemberModelById(churchId, memberId, {}, qr),
      this.membersService.getMemberModelById(churchId, familyId, {}, qr),
    ]);

    return this.fetchAndCreateFamilyRelation(member, family, relation, qr);
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

  private async fetchAndCreateFamilyRelation(
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

  async patchFamilyRelation(
    churchId: number,
    meId: number,
    familyMemberId: number,
    relation: string,
    qr?: QueryRunner,
  ) {
    const [me, familyMember] = await Promise.all([
      this.membersService.getMemberModelById(churchId, meId, {}, qr),
      this.membersService.getMemberModelById(churchId, familyMemberId, {}, qr),
    ]);

    return this.updateFamilyRelation(me, familyMember, relation, qr);
  }

  private async updateFamilyRelation(
    me: MemberModel,
    familyMember: MemberModel,
    relation: string,
    qr?: QueryRunner,
  ) {
    const familyRepository = this.getFamilyRepository(qr);

    const result = await familyRepository.update(
      { meId: me.id, familyMemberId: familyMember.id, deletedAt: IsNull() },
      { relation },
    );

    if (result.affected === 0) {
      throw new NotFoundException(FamilyExceptionMessage.NOT_FOUND);
    }

    return familyRepository.findOne({
      where: { meId: me.id, familyMemberId: familyMember.id },
    });
  }

  async deleteFamilyRelation(
    churchId: number,
    meId: number,
    familyMemberId: number,
    qr?: QueryRunner,
  ) {
    const [me, familyMember] = await Promise.all([
      this.membersService.getMemberModelById(churchId, meId, {}, qr),
      this.membersService.getMemberModelById(churchId, familyMemberId, {}, qr),
    ]);

    return this.deleteFamily(me, familyMember, qr);
  }

  private async deleteFamily(
    me: MemberModel,
    familyMember: MemberModel,
    qr?: QueryRunner,
  ) {
    const familyRepository = this.getFamilyRepository(qr);

    const result = await familyRepository.softDelete({
      me,
      familyMember,
      deletedAt: IsNull(),
    });

    if (result.affected === 0) {
      throw new NotFoundException(FamilyExceptionMessage.NOT_FOUND);
    }

    return 'ok';
  }

  async postFamilyMember(
    churchId: number,
    memberId: number,
    createFamilyDto: CreateFamilyDto,
    qr: QueryRunner,
  ) {
    const [me, familyMember] = await Promise.all([
      this.membersService.getMemberModelById(churchId, memberId, {}, qr),
      this.membersService.getMemberModelById(
        churchId,
        createFamilyDto.familyId,
        {},
        qr,
      ),
    ]);

    return this.createFamilyMember(
      me,
      familyMember,
      createFamilyDto.relation,
      qr,
    );
  }

  private async createFamilyMember(
    me: MemberModel,
    familyMember: MemberModel,
    relation: string,
    qr: QueryRunner,
  ) {
    const familyRepository = this.getFamilyRepository(qr);

    const isExist = await this.isExistFamilyRelation(
      me.id,
      familyMember.id,
      qr,
    );

    if (isExist) {
      throw new BadRequestException(FamilyExceptionMessage.AlREADY_EXISTS);
    }

    await familyRepository.save({
      meId: me.id,
      familyMemberId: familyMember.id,
      relation,
      deletedAt: null,
    });

    const isExistCounter = await this.isExistFamilyRelation(
      familyMember.id,
      me.id,
      qr,
    );

    if (!isExistCounter) {
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
        return relation;
      default:
        return '조카';
    }
  }
}
