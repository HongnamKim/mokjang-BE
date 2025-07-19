import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  IMinistryGroupsDomainService,
  ParentMinistryGroup,
} from '../interface/ministry-groups-domain.service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { MinistryGroupModel } from '../../entity/ministry-group.entity';
import {
  Between,
  FindOptionsOrder,
  FindOptionsRelations,
  IsNull,
  MoreThan,
  MoreThanOrEqual,
  QueryRunner,
  Repository,
  UpdateResult,
} from 'typeorm';
import { ChurchModel } from '../../../../churches/entity/church.entity';
import { MinistryGroupException } from '../../const/exception/ministry-group.exception';
import { CreateMinistryGroupDto } from '../../dto/ministry-group/request/create-ministry-group.dto';
import { UpdateMinistryGroupNameDto } from '../../dto/ministry-group/request/update-ministry-group-name.dto';
import { GroupDepthConstraint } from '../../../const/group-depth.constraint';
import { GetMinistryGroupDto } from '../../dto/ministry-group/request/get-ministry-group.dto';
import { MinistryGroupDomainPaginationResponseDto } from '../../dto/ministry-group/response/ministry-group-domain-pagination-response.dto';
import { MinistryGroupOrderEnum } from '../../const/ministry-group-order.enum';
import { UpdateMinistryGroupStructureDto } from '../../dto/ministry-group/request/update-ministry-group-structure.dto';
import { MemberModel } from '../../../../members/entity/member.entity';

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
    });

    return !!group;
  }

  countAllMinistryGroups(
    church: ChurchModel,
    qr: QueryRunner,
  ): Promise<number> {
    const repository = this.getMinistryGroupsRepository(qr);

    return repository.count({
      where: {
        churchId: church.id,
      },
    });
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

    if (dto.order !== MinistryGroupOrderEnum.CREATED_AT) {
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
  ): Promise<MinistryGroupModel> /*Promise<MinistryGroupWithParentGroups>*/ {
    const ministryGroupsRepository = this.getMinistryGroupsRepository(qr);

    /*const qb = await ministryGroupsRepository
      .createQueryBuilder('ministryGroup')
      .leftJoin('ministryGroup.ministries', 'ministries')
      .addSelect([
        'ministries.id',
        'ministries.name',
        'ministries.membersCount',
      ])
      .leftJoinAndSelect('ministryGroup.members', 'members')
      .leftJoinAndSelect('members.officer', 'officer')
      .leftJoinAndSelect('members.group', 'group')
      .leftJoinAndSelect(
        'members.ministries',
        'member_ministries',
        'ministries.ministryGroupId = :ministryGroupId',
        { ministryGroupId },
      )
      .where('ministryGroup.churchId = :churchId', { churchId: church.id })
      .where('ministryGroup.id = :ministryGroupId', {
        ministryGroupId: ministryGroupId,
      })
      .getOneOrFail();

    return qb;*/

    const ministryGroup = await ministryGroupsRepository.findOne({
      where: {
        churchId: church.id,
        id: ministryGroupId,
      },
    });

    if (!ministryGroup) {
      throw new NotFoundException(MinistryGroupException.NOT_FOUND);
    }

    return ministryGroup;

    /*return {
      ...ministryGroup,
      parentMinistryGroups: await this.findParentMinistryGroups(
        church,
        ministryGroup.id,
        qr,
      ),
    };*/
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
  }

  async createMinistryGroup(
    church: ChurchModel,
    parentMinistryGroup: MinistryGroupModel | null,
    dto: CreateMinistryGroupDto,
    qr: QueryRunner,
  ) {
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

    const [lastOrderMinistryGroup] = await this.ministryGroupsRepository.find({
      where: {
        churchId: church.id,
        parentMinistryGroupId: parentGroup.id,
      },
      order: {
        order: 'desc',
      },
      take: 1,
    });

    const order = lastOrderMinistryGroup ? lastOrderMinistryGroup.order + 1 : 1;

    const newGroup = await ministryGroupsRepository.save({
      churchId: church.id,
      name: dto.name,
      parentMinistryGroupId: parentGroup.id,
      order,
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

    const [lastOrderMinistryGroup] = await this.ministryGroupsRepository.find({
      where: {
        churchId: church.id,
        parentMinistryGroupId: IsNull(),
      },
      order: {
        order: 'desc',
      },
      take: 1,
    });

    const order = lastOrderMinistryGroup ? lastOrderMinistryGroup.order + 1 : 1;

    return ministryGroupsRepository.save({
      churchId: church.id,
      ...dto,
      order,
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

  async updateMinistryGroupName(
    church: ChurchModel,
    targetMinistryGroup: MinistryGroupModel,
    dto: UpdateMinistryGroupNameDto,
    qr: QueryRunner,
  ): Promise<UpdateResult> {
    const repository = this.getMinistryGroupsRepository(qr);

    if (
      targetMinistryGroup.parentMinistryGroupId &&
      targetMinistryGroup.parentMinistryGroup === null
    ) {
      throw new InternalServerErrorException('상위 사역 그룹 불러오기 실패');
    }

    const isExist = await this.isExistMinistryGroup(
      church,
      targetMinistryGroup.parentMinistryGroup,
      dto.name,
      qr,
    );

    if (isExist) {
      throw new ConflictException(MinistryGroupException.ALREADY_EXIST);
    }

    const result = await repository.update(
      {
        id: targetMinistryGroup.id,
      },
      {
        name: dto.name,
      },
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(
        MinistryGroupException.UPDATE_ERROR,
      );
    }

    return result;
  }

  async updateMinistryGroupStructure(
    church: ChurchModel,
    targetMinistryGroup: MinistryGroupModel,
    dto: UpdateMinistryGroupStructureDto,
    qr: QueryRunner,
    newParentMinistryGroup: MinistryGroupModel | null,
  ) {
    if (dto.parentMinistryGroupId !== undefined) {
      // 계층 이동 시 사용 가능한 이름, 그룹 depth 확인
      const isExist = await this.isExistMinistryGroup(
        church,
        newParentMinistryGroup,
        targetMinistryGroup.name,
        qr,
      );

      if (isExist) {
        throw new ConflictException(MinistryGroupException.ALREADY_EXIST);
      }

      if (dto.parentMinistryGroupId && newParentMinistryGroup) {
        await this.validateUpdateHierarchy(
          church,
          targetMinistryGroup,
          newParentMinistryGroup,
          qr,
        );
      }

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

    if (dto.order) {
      const parentMinistryGroupId =
        dto.parentMinistryGroupId === undefined
          ? (targetMinistryGroup.parentMinistryGroupId ?? IsNull()) // 기존 상위그룹 or null
          : (dto.parentMinistryGroupId ?? IsNull()); // 새로운 상위그룹 or null

      const lastOrderMinistryGroup = await ministryGroupsRepository.findOne({
        where: {
          churchId: church.id,
          parentMinistryGroupId: parentMinistryGroupId,
        },
        order: {
          order: 'desc',
        },
      });

      const lastOrder = lastOrderMinistryGroup
        ? lastOrderMinistryGroup.order
        : 1;

      if (dto.parentMinistryGroupId === undefined && dto.order > lastOrder) {
        throw new BadRequestException(MinistryGroupException.INVALID_ORDER);
      } else if (
        dto.parentMinistryGroupId !== undefined &&
        dto.order > lastOrder + 1
      ) {
        throw new BadRequestException(MinistryGroupException.INVALID_ORDER);
      }

      // 계층이 변하는 경우
      if (dto.parentMinistryGroupId !== undefined) {
        // 기존 계층 순서 변경
        await ministryGroupsRepository.update(
          {
            churchId: church.id,
            parentMinistryGroupId:
              targetMinistryGroup.parentMinistryGroupId ?? IsNull(),
            order: MoreThanOrEqual(targetMinistryGroup.order),
          },
          {
            order: () => 'order - 1',
          },
        );
        // 새로운 계층 순서 변경
        await ministryGroupsRepository.update(
          {
            churchId: church.id,
            parentMinistryGroupId: parentMinistryGroupId,
            order: MoreThanOrEqual(dto.order),
          },
          {
            order: () => 'order + 1',
          },
        );
      } else {
        const isMovingDown = dto.order > targetMinistryGroup.order;
        const [from, to] = isMovingDown
          ? [targetMinistryGroup.order + 1, dto.order]
          : [dto.order, targetMinistryGroup.order - 1];

        await ministryGroupsRepository.update(
          {
            churchId: church.id,
            parentMinistryGroupId,
            order: Between(from, to),
          },
          {
            order: () => (isMovingDown ? 'order - 1' : 'order + 1'),
          },
        );
      }
    }

    const result = await ministryGroupsRepository.update(
      {
        id: targetMinistryGroup.id,
      },
      {
        order: dto.order,
        parentMinistryGroupId:
          newParentMinistryGroup === null ? null : newParentMinistryGroup.id,
      },
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(
        MinistryGroupException.UPDATE_ERROR,
      );
    }

    return result;
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
    qr: QueryRunner,
  ) {
    const ministryGroupsRepository = this.getMinistryGroupsRepository(qr);

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

    await ministryGroupsRepository.update(
      {
        churchId: church.id,
        parentMinistryGroupId: targetMinistryGroup.parentMinistryGroupId
          ? targetMinistryGroup.parentMinistryGroupId
          : IsNull(),
        order: MoreThan(targetMinistryGroup.order),
      },
      {
        order: () => 'order - 1',
      },
    );

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

  async addMembersToMinistryGroup(
    ministryGroup: MinistryGroupModel,
    members: MemberModel[],
    qr: QueryRunner,
  ): Promise<void> {
    try {
      const memberIds = members.map((member) => member.id);

      await qr.manager
        .createQueryBuilder()
        .relation(MinistryGroupModel, 'members')
        .of(ministryGroup.id)
        .add(memberIds);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException(
          '사역그룹에 이미 존재하는 교인이 있습니다.',
        );
      }

      throw error;
    }

    return;
  }

  async removeMembersFromMinistryGroup(
    ministryGroup: MinistryGroupModel,
    members: MemberModel[],
    qr: QueryRunner,
  ): Promise<void> {
    const memberIds = members.map((member) => member.id);

    await qr.manager
      .createQueryBuilder()
      .relation(MinistryGroupModel, 'members')
      .of(ministryGroup.id)
      .remove(memberIds);

    return;
  }

  async updateMembersCount(
    ministryGroup: MinistryGroupModel,
    count: number,
    qr: QueryRunner,
  ): Promise<UpdateResult> {
    const repository = this.getMinistryGroupsRepository(qr);

    const result = await repository.increment(
      { id: ministryGroup.id },
      'membersCount',
      count,
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(
        MinistryGroupException.UPDATE_ERROR,
      );
    }

    return result;
  }

  async updateMinistryGroupLeader(
    ministryGroup: MinistryGroupModel,
    newLeaderMember: MemberModel,
    qr: QueryRunner,
  ): Promise<UpdateResult> {
    const repository = this.getMinistryGroupsRepository(qr);

    const result = await repository.update(
      { id: ministryGroup.id },
      { leaderMemberId: newLeaderMember.id },
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(
        MinistryGroupException.UPDATE_ERROR,
      );
    }

    return result;
  }

  async incrementMinistriesCount(
    ministryGroup: MinistryGroupModel,
    qr: QueryRunner,
  ): Promise<UpdateResult> {
    const repository = this.getMinistryGroupsRepository(qr);

    const result = await repository.increment(
      { id: ministryGroup.id },
      'ministriesCount',
      1,
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(
        MinistryGroupException.UPDATE_ERROR,
      );
    }

    return result;
  }
}
