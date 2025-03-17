import { Injectable, NotFoundException } from '@nestjs/common';
import {
  IMinistryGroupsDomainService,
  MinistryGroupWithParentGroups,
  ParentMinistryGroup,
} from './interface/ministry-groups-domain.service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { MinistryGroupModel } from '../entity/ministry-group.entity';
import { FindOptionsRelations, IsNull, QueryRunner, Repository } from 'typeorm';
import { ChurchModel } from '../../../churches/entity/church.entity';
import { MinistryGroupException } from '../const/ministry-group.exception';
import { CreateMinistryGroupDto } from '../dto/create-ministry-group.dto';

@Injectable()
export class MinistryGroupsDomainService
  implements IMinistryGroupsDomainService
{
  constructor(
    @InjectRepository(MinistryGroupModel)
    private readonly ministryGroupsRepository: Repository<MinistryGroupModel>,
  ) {}

  private getMinistryGroupsRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(MinistryGroupModel)
      : this.ministryGroupsRepository;
  }

  private async isExistMinistryGroup(
    church: ChurchModel,
    name: string,
    parentMinistryGroup?: MinistryGroupModel,
    qr?: QueryRunner,
  ) {
    const ministryGroupsRepository = this.getMinistryGroupsRepository(qr);

    const group = await ministryGroupsRepository.findOne({
      where: {
        churchId: church.id,
        parentMinistryGroupId: parentMinistryGroup
          ? parentMinistryGroup.id
          : IsNull(),
        name,
      },
    });

    return !!group;
  }

  async getMinistryGroups(church: ChurchModel, qr?: QueryRunner) {
    const ministryGroupsRepository = this.getMinistryGroupsRepository(qr);

    return ministryGroupsRepository.find({
      where: {
        churchId: church.id,
      },
      order: { createdAt: 'ASC' },
    });
  }

  async findMinistryGroupModelById(
    church: ChurchModel,
    ministryGroupId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<MinistryGroupModel>,
  ) {
    const ministryGroupsRepository = this.getMinistryGroupsRepository(qr);

    const ministryGroup = await ministryGroupsRepository.findOne({
      where: {
        churchId: church.id,
        id: ministryGroupId,
      },
      relations: {
        ...relationOptions,
      },
    });

    if (!ministryGroup) {
      throw new NotFoundException(MinistryGroupException.NOT_FOUND);
    }

    return ministryGroup;
  }

  async findMinistryGroupById(
    church: ChurchModel,
    ministryGroupId: number,
    qr?: QueryRunner,
  ): Promise<MinistryGroupWithParentGroups> {
    const ministryGroupsRepository = this.getMinistryGroupsRepository(qr);

    const ministryGroup = await ministryGroupsRepository.findOne({
      where: {
        churchId: church.id,
        id: ministryGroupId,
      },
      relations: {
        ministries: true,
      },
    });

    if (!ministryGroup) {
      throw new NotFoundException(MinistryGroupException.NOT_FOUND);
    }

    return {
      ...ministryGroup,
      parentMinistryGroups: await this.findParentMinistryGroups(
        church,
        ministryGroup.id,
      ),
    };
  }

  async findParentMinistryGroups(
    church: ChurchModel,
    ministryGroupId: number,
    qr?: QueryRunner,
  ) {
    const ministryGroupsRepository = this.getMinistryGroupsRepository(qr);

    const parents = await ministryGroupsRepository.query(
      `
    WITH RECURSIVE parent_groups AS (
      -- 초기 그룹의 부모
      SELECT g.* 
      FROM ministry_group_model g
      JOIN ministry_group_model child 
      ON g.id = child."parentMinistryGroupId"
      WHERE child.id = $1 AND child."churchId" = $2
      
      UNION ALL
      
      -- 재귀적으로 부모의 부모 찾기
      SELECT g.*
      FROM ministry_group_model g
      JOIN parent_groups pg 
      ON g.id = pg."parentMinistryGroupId"
    )
    SELECT * FROM parent_groups;
    `,
      [ministryGroupId, church.id],
    );

    let result: ParentMinistryGroup[] = [];

    parents.forEach((parent: MinistryGroupModel, i: number) => {
      result.unshift({
        id: parent.id,
        name: parent.name,
        parentMinistryGroupId: parent.parentMinistryGroupId,
        depth: parents.length - i,
      });
    });

    return result;
  }

  async createMinistryGroup(
    church: ChurchModel,
    dto: CreateMinistryGroupDto,
    qr: QueryRunner,
  ) {
    const ministryGroupsRepository = this.getMinistryGroupsRepository(qr);
  }
}
