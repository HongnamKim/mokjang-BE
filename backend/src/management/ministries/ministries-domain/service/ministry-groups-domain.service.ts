import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  IMinistryGroupsDomainService,
  MinistryGroupWithParentGroups,
  ParentMinistryGroup,
} from '../interface/ministry-groups-domain.service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { MinistryGroupModel } from '../../entity/ministry-group.entity';
import {
  FindOptionsOrder,
  FindOptionsRelations,
  IsNull,
  QueryRunner,
  Repository,
} from 'typeorm';
import { ChurchModel } from '../../../../churches/entity/church.entity';
import { MinistryGroupException } from '../../const/exception/ministry-group.exception';
import { CreateMinistryGroupDto } from '../../dto/ministry-group/create-ministry-group.dto';
import { UpdateMinistryGroupDto } from '../../dto/ministry-group/update-ministry-group.dto';
import { GroupDepthConstraint } from '../../../const/group-depth.constraint';
import { GetMinistryGroupDto } from '../../dto/ministry-group/get-ministry-group.dto';
import { MinistryGroupDomainPaginationResponseDto } from '../../dto/ministry-group/response/ministry-group-domain-pagination-response.dto';
import { MinistryGroupOrderEnum } from '../../const/ministry-group-order.enum';

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
    parentMinistryGroup: MinistryGroupModel | null,
    name: string,
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
      withDeleted: true,
    });

    if (group) {
      if (group.deletedAt) {
        await ministryGroupsRepository.remove(group);

        return false;
      }
    }

    return !!group;
  }

  async findMinistryGroups(
    church: ChurchModel,
    parentMinistryGroup: MinistryGroupModel | null,
    dto: GetMinistryGroupDto,
    qr?: QueryRunner,
  ) {
    const ministryGroupsRepository = this.getMinistryGroupsRepository(qr);

    const order: FindOptionsOrder<MinistryGroupModel> = {
      [dto.order]: dto.orderDirection,
    };

    if (dto.order !== MinistryGroupOrderEnum.createdAt) {
      order.createdAt = 'asc';
    }

    const [data, totalCount] = await Promise.all([
      ministryGroupsRepository.find({
        where: {
          churchId: church.id,
          parentMinistryGroupId: parentMinistryGroup
            ? parentMinistryGroup.id
            : IsNull(),
        },
        order,
        take: dto.take,
        skip: dto.take * (dto.page - 1),
      }),
      ministryGroupsRepository.count({
        where: {
          churchId: church.id,
        },
      }),
    ]);

    return new MinistryGroupDomainPaginationResponseDto(data, totalCount);
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

  async findChildMinistryGroups(
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
      SELECT id, "parentMinistryGroupId", 1 as depth, name
    FROM ministry_group_model
    WHERE "parentMinistryGroupId" = $1 AND "deletedAt" IS NULL 
    
    UNION ALL 
    
    SELECT g.id, g."parentMinistryGroupId", gt.depth + 1, g.name
    FROM ministry_group_model g
    INNER JOIN group_tree gt ON g."parentMinistryGroupId" = gt.id
    WHERE g."deletedAt" IS NULL
    )
    SELECT id, depth, "parentMinistryGroupId", name FROM group_tree
        `,
      [ministryGroup.id],
    );

    return subGroupsQuery;
    /*
    subGroupsQuery.forEach(console.log);
    //subGroupsQuery.forEach((row) => console.log(row));

    return subGroupsQuery.map((row: any) => row.id);*/
  }

  async createMinistryGroup(
    church: ChurchModel,
    parentMinistryGroup: MinistryGroupModel | null,
    dto: CreateMinistryGroupDto,
    qr: QueryRunner,
  ) {
    /*const parentMinistryGroup = dto.parentMinistryGroupId
      ? await this.findMinistryGroupModelById(
          church,
          dto.parentMinistryGroupId,
          qr,
        )
      : null;*/

    await this.checkIsAvailableName(church, parentMinistryGroup, dto.name, qr);

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

  private async checkIsAvailableName(
    church: ChurchModel,
    parentMinistryGroup: MinistryGroupModel | null,
    name: string,
    qr: QueryRunner,
  ) {
    const isExist = await this.isExistMinistryGroup(
      church,
      parentMinistryGroup,
      name,
      qr,
    );

    if (isExist) {
      throw new ConflictException(MinistryGroupException.ALREADY_EXIST);
    }

    return true;
  }

  async updateMinistryGroup(
    church: ChurchModel,
    targetMinistryGroup: MinistryGroupModel,
    dto: UpdateMinistryGroupDto,
    qr: QueryRunner,
    newParentMinistryGroup: MinistryGroupModel | null,
  ) {
    const newName = dto.name ?? targetMinistryGroup.name;

    // 사용 가능한 그룹인지 체크 --> 불가능할 경우 ConflictException
    await this.checkIsAvailableName(
      church,
      newParentMinistryGroup,
      newName,
      qr,
    );

    // 새로운 상위 그룹에 넣을 경우
    if (
      newParentMinistryGroup &&
      newParentMinistryGroup.id !== targetMinistryGroup.parentMinistryGroupId
    ) {
      await this.validateUpdateHierarchy(
        church,
        targetMinistryGroup,
        newParentMinistryGroup,
        qr,
      );
    }

    if (dto.parentMinistryGroupId !== undefined) {
      // 기존 상위 그룹에서 타겟 그룹 id 제거
      await this.removeChildMinistryGroupId(
        targetMinistryGroup.parentMinistryGroup,
        targetMinistryGroup,
        qr,
      );
      // 새로운 상위 그룹에 타겟 그룹 id 추가
      await this.appendChildMinistryGroupId(
        newParentMinistryGroup,
        targetMinistryGroup,
        qr,
      );
    }

    const ministryGroupsRepository = this.getMinistryGroupsRepository(qr);

    const result = await ministryGroupsRepository.update(
      {
        id: targetMinistryGroup.id,
      },
      {
        name: dto.name,
        parentMinistryGroupId:
          newParentMinistryGroup === null ? null : newParentMinistryGroup.id,
      },
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(
        MinistryGroupException.UPDATE_ERROR,
      );
    }

    return this.findMinistryGroupById(church, targetMinistryGroup.id, qr);
  }

  private async validateUpdateHierarchy(
    church: ChurchModel,
    targetMinistryGroup: MinistryGroupModel,
    newParentMinistryGroup: MinistryGroupModel,
    qr: QueryRunner,
  ) {
    const allChildMinistryGroups = await this.findChildMinistryGroups(
      church,
      targetMinistryGroup.id,
      qr,
    );

    const allChildMinistryGroupIds = allChildMinistryGroups.map(
      (group) => group.id,
    );

    const maxChildMinistryGroupDepth =
      allChildMinistryGroups.length > 0
        ? Math.max(...allChildMinistryGroups.map((group) => group.depth))
        : 0;

    // 계층 역전 확인
    if (allChildMinistryGroupIds.includes(newParentMinistryGroup.id)) {
      throw new BadRequestException(
        MinistryGroupException.CANNOT_SET_SUBGROUP_AS_PARENT,
      );
    }

    //depth 확인
    const newParentsDepth = (
      await this.findParentMinistryGroups(church, newParentMinistryGroup.id, qr)
    )
      .map((group) => group.id)
      .push(newParentMinistryGroup.id);

    // 5 depth 초과 시 에러
    // 부모 그룹 depth + 자식 그룹 depth + 자신
    const newDepth = newParentsDepth + maxChildMinistryGroupDepth + 1;

    if (newDepth > GroupDepthConstraint.MAX_DEPTH) {
      throw new BadRequestException(MinistryGroupException.LIMIT_DEPTH_REACHED);
    }
  }

  async deleteMinistryGroup(
    church: ChurchModel,
    targetMinistryGroup: MinistryGroupModel,
    //ministryGroupId: number,
    qr: QueryRunner,
  ) {
    const ministryGroupsRepository = this.getMinistryGroupsRepository(qr);

    /*const ministryGroup = await this.findMinistryGroupModelById(
      church,
      ministryGroupId,
      qr,
      { parentMinistryGroup: true, ministries: true },
    );*/

    // 하위 그룹 or 사역 체크
    if (
      targetMinistryGroup.childMinistryGroupIds.length > 0 ||
      targetMinistryGroup.ministries.length > 0
    ) {
      throw new BadRequestException(
        MinistryGroupException.GROUP_HAS_DEPENDENCIES,
      );
    }

    await ministryGroupsRepository.softDelete({
      id: targetMinistryGroup.id,
      deletedAt: IsNull(),
    });

    await this.removeChildMinistryGroupId(
      targetMinistryGroup.parentMinistryGroup,
      targetMinistryGroup,
      qr,
    );

    return;
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
