import { Injectable } from '@nestjs/common';
import { IDummyGroupDomainService } from '../interface/dummy-group-domain.service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { GroupModel } from '../../../management/groups/entity/group.entity';
import { QueryRunner, Repository } from 'typeorm';
import { ChurchModel } from '../../../churches/entity/church.entity';

@Injectable()
export class DummyGroupDomainService implements IDummyGroupDomainService {
  constructor(
    @InjectRepository(GroupModel)
    private readonly repository: Repository<GroupModel>,
  ) {}

  private getRepository(qr?: QueryRunner) {
    return qr ? qr.manager.getRepository(GroupModel) : this.repository;
  }

  async createDummyGroups(church: ChurchModel, qr: QueryRunner) {
    const repository = this.getRepository(qr);

    const firstGroupModel = repository.create([
      {
        churchId: church.id,
        name: '장년부',
        order: 1,
      },
      {
        churchId: church.id,
        name: '교회학교',
        order: 2,
      },
    ]);

    const [firstGroup, childGroup] = await repository.save(firstGroupModel);

    const secondGroupModels = repository.create([
      {
        churchId: church.id,
        name: '남선교회',
        order: 1,
        parentGroupId: firstGroup.id,
      },
      {
        churchId: church.id,
        name: '여선교회',
        order: 2,
        parentGroupId: firstGroup.id,
      },
    ]);

    const secondGroups = await repository.save(secondGroupModels);

    await repository.update(
      { id: firstGroup.id },
      { childGroupIds: secondGroups.map((group) => group.id) },
    );

    return {
      maleGroup: secondGroups[0],
      femaleGroup: secondGroups[1],
      childGroup,
    };
  }

  async updateMembersCount(
    values: { group: GroupModel; count: number }[],
    qr: QueryRunner,
  ) {
    const repository = this.getRepository(qr);

    const updateValue = repository.create(
      values.map((value) => ({
        ...value.group,
        membersCount: value.count,
      })),
    );

    await repository.save(updateValue);
  }

  deleteDummyGroupsCascade(church: ChurchModel, qr: QueryRunner) {
    const repository = this.getRepository(qr);

    return repository.delete({ churchId: church.id });
  }
}
