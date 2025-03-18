import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
import { UpdateMinistryGroupDto } from '../dto/update-ministry-group.dto';

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
    parentMinistryGroup?: MinistryGroupModel | null,
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

  async findMinistryGroups(church: ChurchModel, qr?: QueryRunner) {
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
        qr,
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

  async findChildMinistryGroupIds(
    church: ChurchModel,
    ministryGroupId: number,
    qr?: QueryRunner,
  ) {
    const ministryGroupsRepository = this.getMinistryGroupsRepository(qr);

    const ministryGroup = await this.findMinistryGroupModelById(
      church,
      ministryGroupId,
      qr,
    );

    const subGroupsQuery = await ministryGroupsRepository.query(
      `
        WITH RECURSIVE group_tree AS (
      -- 초기 그룹의 직계 그룹들
      SELECT id, "parentMinistryGroupId", 1 as level, name
    FROM ministry_group_model
    WHERE "parentMinistryGroupId" = $1 AND "deletedAt" IS NULL 
    
    UNION ALL 
    
    SELECT g.id, g."parentMinistryGroupId", gt.level + 1, g.name
    FROM ministry_group_model g
    INNER JOIN group_tree gt ON g."parentMinistryGroupId" = gt.id
    WHERE g."deletedAt" IS NULL
    )
    SELECT id, level, name FROM group_tree
        `,
      [ministryGroup.id],
    );

    return subGroupsQuery.map((row: any) => row.id);
  }

  async createMinistryGroup(
    church: ChurchModel,
    dto: CreateMinistryGroupDto,
    qr: QueryRunner,
  ) {
    const parentMinistryGroup = dto.parentMinistryGroupId
      ? await this.findMinistryGroupModelById(
          church,
          dto.parentMinistryGroupId,
          qr,
        )
      : undefined;

    const isExist = await this.isExistMinistryGroup(
      church,
      dto.name,
      parentMinistryGroup,
      qr,
    );

    if (isExist) {
      throw new BadRequestException(MinistryGroupException.ALREADY_EXIST);
    }

    return parentMinistryGroup
      ? this.handleLeafMinistryGroup(church, parentMinistryGroup, dto, qr)
      : this.handleNodeMinistryGroup(church, dto, qr);
  }

  private async handleLeafMinistryGroup(
    church: ChurchModel,
    parentGroup: MinistryGroupModel,
    dto: CreateMinistryGroupDto,
    qr: QueryRunner,
  ) {
    const ministryGroupsRepository = this.getMinistryGroupsRepository(qr);

    const grandParentGroups = await this.findParentMinistryGroups(
      church,
      parentGroup.id,
      qr,
    );

    if (grandParentGroups.length + 1 >= 5) {
      throw new BadRequestException(MinistryGroupException.LIMIT_DEPTH_REACHED);
    }

    const newGroup = await ministryGroupsRepository.save({
      churchId: church.id,
      name: dto.name,
      parentMinistryGroupId: parentGroup.id,
    });

    await this.appendChildMinistryGroupId(parentGroup, newGroup, qr);

    return newGroup;
  }

  private async handleNodeMinistryGroup(
    church: ChurchModel,
    dto: CreateMinistryGroupDto,
    qr: QueryRunner,
  ) {
    const ministryGroupsRepository = this.getMinistryGroupsRepository(qr);

    return ministryGroupsRepository.save({
      churchId: church.id,
      ...dto,
    });
  }

  async updateMinistryGroup(
    church: ChurchModel,
    ministryGroupId: number,
    dto: UpdateMinistryGroupDto,
    qr: QueryRunner,
  ) {
    const ministryGroupsRepository = this.getMinistryGroupsRepository(qr);

    const ministryGroup = await this.findMinistryGroupModelById(
      church,
      ministryGroupId,
      qr,
      { parentMinistryGroup: true },
    );

    // 이름 중복 체크 시작
    // 부모 변경 시 새로운 부모 그룹 || 기존 부모 그룹 (노드 그룹일 경우 null)
    let newParentGroup: MinistryGroupModel | null = dto.parentMinistryGroupId
      ? await this.findMinistryGroupModelById(
          church,
          dto.parentMinistryGroupId,
          qr,
        )
      : ministryGroup.parentMinistryGroup;

    // 업데이트 대상을 최상위 그룹으로 옮기는 경우
    if (dto.parentMinistryGroupId === 0) {
      newParentGroup = null;
    }

    // 변경하려는 이름 || 기존 이름
    const newName = dto.name ? dto.name : ministryGroup.name;

    const isExist = await this.isExistMinistryGroup(
      church,
      newName,
      newParentGroup,
      qr,
    );

    if (isExist) {
      throw new BadRequestException(MinistryGroupException.ALREADY_EXIST);
    }
    // 이름 중복 체크 종료

    // 부모 변경 시 체크
    if (
      (dto.parentMinistryGroupId && newParentGroup) ||
      dto.parentMinistryGroupId === 0
    ) {
      // 1. 의존 관계 역전인지
      if (
        ministryGroup.childMinistryGroupIds.includes(dto.parentMinistryGroupId)
      ) {
        throw new BadRequestException(
          MinistryGroupException.CANNOT_SET_SUBGROUP_AS_PARENT,
        );
      }

      // 2. 그룹의 depth 확인
      const newGrandParentGroups = await this.findParentMinistryGroups(
        church,
        dto.parentMinistryGroupId,
        qr,
      );

      if (newGrandParentGroups.length + 1 >= 5) {
        throw new BadRequestException(
          MinistryGroupException.LIMIT_DEPTH_REACHED,
        );
      }

      // 이전 상위 그룹, 새로운 상위 그룹의 childGroupId 수정
      await Promise.all([
        this.appendChildMinistryGroupId(newParentGroup, ministryGroup, qr),
        this.removeChildMinistryGroupId(
          ministryGroup.parentMinistryGroup,
          ministryGroup,
          qr,
        ),
      ]);
    }

    // 업데이트 수행
    const result = await ministryGroupsRepository.update(
      {
        id: ministryGroupId,
        deletedAt: IsNull(),
      },
      {
        ...dto,
        parentMinistryGroupId:
          dto.parentMinistryGroupId === 0 ? null : dto.parentMinistryGroupId,
      },
    );

    if (result.affected === 0) {
      throw new NotFoundException(MinistryGroupException.NOT_FOUND);
    }

    return this.findMinistryGroupById(church, ministryGroupId, qr);
  }

  async deleteMinistryGroup(
    church: ChurchModel,
    ministryGroupId: number,
    qr: QueryRunner,
  ) {
    const ministryGroupsRepository = this.getMinistryGroupsRepository(qr);

    const ministryGroup = await this.findMinistryGroupModelById(
      church,
      ministryGroupId,
      qr,
      { parentMinistryGroup: true, ministries: true },
    );

    // 하위 그룹 or 사역 체크
    if (
      ministryGroup.childMinistryGroupIds.length > 0 ||
      ministryGroup.ministries.length > 0
    ) {
      throw new BadRequestException(
        MinistryGroupException.GROUP_HAS_DEPENDENCIES,
      );
    }

    await ministryGroupsRepository.softDelete({
      id: ministryGroupId,
      deletedAt: IsNull(),
    });

    await this.removeChildMinistryGroupId(
      ministryGroup.parentMinistryGroup,
      ministryGroup,
      qr,
    );

    return `ministryGroupId ${ministryGroupId} deleted`;
  }

  private async appendChildMinistryGroupId(
    parentMinistryGroup: MinistryGroupModel | null,
    childMinistryGroup: MinistryGroupModel,
    qr: QueryRunner,
  ) {
    if (!parentMinistryGroup) {
      return;
    }

    const ministryGroupsRepository = this.getMinistryGroupsRepository(qr);

    await ministryGroupsRepository
      .createQueryBuilder(undefined, qr)
      .update()
      .set({
        childMinistryGroupIds: () =>
          `array_append("childMinistryGroupIds", :childMinistryGroupId)`,
      })
      .where('id= :id', { id: parentMinistryGroup.id })
      .setParameters({ childMinistryGroupId: childMinistryGroup.id })
      .execute();
  }

  private async removeChildMinistryGroupId(
    parentMinistryGroup: MinistryGroupModel | null,
    childMinistryGroup: MinistryGroupModel,
    qr: QueryRunner,
  ) {
    if (!parentMinistryGroup) {
      return;
    }

    const ministryGroupsRepository = this.getMinistryGroupsRepository(qr);

    await ministryGroupsRepository
      .createQueryBuilder(undefined, qr)
      .update()
      .set({
        childMinistryGroupIds: () =>
          `array_remove("childMinistryGroupIds", :childMinistryGroupId)`,
      })
      .where('id= :id', { id: parentMinistryGroup.id })
      .setParameters({ childMinistryGroupId: childMinistryGroup.id })
      .execute();
  }
}
