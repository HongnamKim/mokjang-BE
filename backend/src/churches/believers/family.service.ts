import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
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
    //private readonly believersService: BelieversService,
  ) {}

  private getFamilyRepository(qr?: QueryRunner) {
    return qr ? qr.manager.getRepository(FamilyModel) : this.familyRepository;
  }

  private async isExistFamilyRelation(
    meId: number,
    familyMemberId: number,
    qr?: QueryRunner,
  ) {
    const familyRepository = this.getFamilyRepository(qr);

    const isExist = await this.familyRepository.findOne({
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

  async postFamilyRelation(
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

  async patchFamilyRelation(
    me: BelieverModel,
    familyMember: BelieverModel,
    relation: string,
  ) {
    const result = await this.familyRepository.update(
      { meId: me.id, familyMemberId: familyMember.id },
      { relation },
    );

    if (result.affected === 0) {
      throw new NotFoundException('해당 가족 관계를 찾을 수 없습니다.');
    }

    return this.familyRepository.findOne({
      where: { meId: me.id, familyMemberId: familyMember.id },
    });
  }
}
