import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FamilyModel } from './entity/family.entity';
import { QueryRunner, Repository } from 'typeorm';
import { BelieverModel } from './entity/believer.entity';
import { BelieversService } from './believers.service';

@Injectable()
export class FamilyService {
  constructor(
    @InjectRepository(FamilyModel)
    private readonly familyRepository: Repository<FamilyModel>,
    private readonly believersService: BelieversService,
  ) {}

  async getFamilyMember(churchId: number, believerId: number) {
    const believer = (await this.believersService.getBelieversById(
      churchId,
      believerId,
      {},
      null,
      true,
    )) as BelieverModel;

    return this.familyRepository.find({
      where: { meId: believerId },
      relations: { familyMember: true },
    });
  }

  async postFamilyMember(
    churchId: number,
    believerId: number,
    familyId: number,
    relation: string,
    qr?: QueryRunner,
  ) {
    const believer = (await this.believersService.getBelieversById(
      churchId,
      believerId,
      {},
      qr,
      true,
    )) as BelieverModel;

    const family = (await this.believersService.getBelieversById(
      churchId,
      familyId,
      {},
      qr,
      true,
    )) as BelieverModel;

    return this.createFamilyRelation(believer, family, relation, qr);
  }

  private getFamilyRepository(qr?: QueryRunner) {
    return qr ? qr.manager.getRepository(FamilyModel) : this.familyRepository;
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

  async getFamilyIds(believerId: number, qr?: QueryRunner) {
    const familyRepository = this.getFamilyRepository(qr);

    return (
      await familyRepository.find({
        where: {
          meId: believerId,
        },
      })
    ).map((relation) => relation.familyMemberId);
  }

  private async createFamilyRelation(
    me: BelieverModel,
    newFamilyMember: BelieverModel,
    relation: string,
    qr?: QueryRunner,
  ) {
    const familyRepository = this.getFamilyRepository(qr);

    const isExist = await this.isExistFamilyRelation(me.id, newFamilyMember.id);

    if (isExist) {
      throw new BadRequestException('이미 존재하는 가족 관계입니다.');
    }

    const newFamilyExistingFamilyIds = await this.getFamilyIds(
      newFamilyMember.id,
      qr,
    );
    newFamilyExistingFamilyIds.push(newFamilyMember.id);

    const myFamilyIds = await this.getFamilyIds(me.id, qr);
    myFamilyIds.push(me.id);

    for (const newFamilyExistingFamilyId of newFamilyExistingFamilyIds) {
      for (const myFamilyId of myFamilyIds) {
        const isRelationFixed =
          myFamilyId === me.id &&
          newFamilyExistingFamilyId === newFamilyMember.id;

        await familyRepository.save({
          meId: myFamilyId,
          familyMemberId: newFamilyExistingFamilyId,
          relation: isRelationFixed ? relation : '가족',
        });

        await familyRepository.save({
          meId: newFamilyExistingFamilyId,
          familyMemberId: myFamilyId,
          relation: isRelationFixed ? `${relation} 반대` : '가족',
        });
      }
    }
  }

  async updateFamilyRelation(
    churchId: number,
    meId: number,
    familyMemberId: number,
    relation: string,
    qr?: QueryRunner,
  ) {
    const me = (await this.believersService.getBelieversById(
      churchId,
      meId,
      {},
      qr,
      true,
    )) as BelieverModel;

    const familyMember = (await this.believersService.getBelieversById(
      churchId,
      familyMemberId,
      {},
      qr,
      true,
    )) as BelieverModel;

    return this.patchFamilyRelation(me, familyMember, relation, qr);
  }

  private async patchFamilyRelation(
    me: BelieverModel,
    familyMember: BelieverModel,
    relation: string,
    qr?: QueryRunner,
  ) {
    const familyRepository = this.getFamilyRepository(qr);

    const result = await familyRepository.update(
      { meId: me.id, familyMemberId: familyMember.id },
      { relation },
    );

    if (result.affected === 0) {
      throw new NotFoundException('해당 가족 관계를 찾을 수 없습니다.');
    }

    return familyRepository.findOne({
      where: { meId: me.id, familyMemberId: familyMember.id },
    });
  }
}
