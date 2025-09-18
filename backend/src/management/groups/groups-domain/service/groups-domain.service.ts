import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  ChildGroup,
  IGroupsDomainService,
  ParentGroup,
} from '../interface/groups-domain.service.interface';
import { ChurchModel } from '../../../../churches/entity/church.entity';
import { CreateGroupDto } from '../../dto/request/create-group.dto';
import {
  Between,
  FindOptionsOrder,
  FindOptionsRelations,
  In,
  IsNull,
  MoreThan,
  MoreThanOrEqual,
  QueryRunner,
  Repository,
  UpdateResult,
} from 'typeorm';
import { GroupModel } from '../../entity/group.entity';
import { UpdateGroupNameDto } from '../../dto/request/update-group-name.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { GroupException } from '../../const/exception/group.exception';
import { GroupDepthConstraint } from '../../../const/group-depth.constraint';
import { GetGroupDto } from '../../dto/request/get-group.dto';
import { GroupOrderEnum } from '../../const/group-order.enum';
import { UpdateGroupStructureDto } from '../../dto/request/update-group-structure.dto';
import { MemberModel } from '../../../../members/entity/member.entity';
import { GroupRole } from '../../const/group-role.enum';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class GroupsDomainService implements IGroupsDomainService {
  constructor(
    @InjectRepository(GroupModel)
    private readonly groupsRepository: Repository<GroupModel>,
    @Inject(CACHE_MANAGER)
    private readonly cache: Cache,
  ) {}

  private getGroupsRepository(qr?: QueryRunner) {
    return qr ? qr.manager.getRepository(GroupModel) : this.groupsRepository;
  }

  private async isExistGroup(
    church: ChurchModel,
    parentGroup: GroupModel | null,
    groupName: string,
    qr?: QueryRunner,
  ) {
    const groupsRepository = this.getGroupsRepository(qr);

    const existingGroup = await groupsRepository.findOne({
      where: {
        churchId: church.id,
        parentGroupId: parentGroup ? parentGroup.id : IsNull(),
        name: groupName,
      },
    });

    return !!existingGroup;
  }

  async countAllGroups(church: ChurchModel, qr: QueryRunner): Promise<number> {
    const repository = this.getGroupsRepository(qr);

    return repository.count({
      where: {
        churchId: church.id,
      },
    });
  }

  async findGroups(
    church: ChurchModel,
    dto: GetGroupDto,
  ): Promise<GroupModel[]> {
    const groupsRepository = this.getGroupsRepository();

    const order: FindOptionsOrder<GroupModel> = {
      [dto.order]: dto.orderDirection,
    };

    if (dto.order !== GroupOrderEnum.createdAt) {
      order.createdAt = 'asc';
    }

    return groupsRepository.find({
      where: {
        churchId: church.id,
        parentGroupId: dto.parentGroupId === 0 ? IsNull() : dto.parentGroupId,
      },
      order,
      take: dto.take,
      skip: dto.take * (dto.page - 1),
    });

    /*const [data, totalCount] = await Promise.all([
      groupsRepository.find({
        where: {
          churchId: church.id,
          parentGroupId: dto.parentGroupId === 0 ? IsNull() : dto.parentGroupId,
        },
        order,
        take: dto.take,
        skip: dto.take * (dto.page - 1),
      }),
      groupsRepository.count({
        where: {
          churchId: church.id,
          parentGroupId: dto.parentGroupId === 0 ? IsNull() : dto.parentGroupId,
        },
      }),
    ]);

    return new GroupDomainPaginationResultDto(data, totalCount);*/
  }

  async findGroupModelById(
    church: ChurchModel,
    groupId: number,
    qr?: QueryRunner,
    relationsOptions?: FindOptionsRelations<GroupModel>,
  ) {
    const groupsRepository = this.getGroupsRepository(qr);

    const group = await groupsRepository.findOne({
      where: {
        churchId: church.id,
        id: groupId,
      },
      relations: relationsOptions,
    });

    if (!group) {
      throw new NotFoundException(GroupException.NOT_FOUND);
    }

    return group;
  }

  async findGroupModelsByIds(
    church: ChurchModel,
    groupIds: number[],
    qr?: QueryRunner,
    relationsOptions?: FindOptionsRelations<GroupModel>,
  ) {
    const groupRepository = this.getGroupsRepository(qr);

    const groups = await groupRepository.find({
      where: {
        churchId: church.id,
        id: In(groupIds),
      },
      relations: relationsOptions,
    });

    if (groups.length !== groupIds.length) {
      throw new NotFoundException(GroupException.NOT_FOUND);
    }

    return groups;
  }

  async findGroupById(
    church: ChurchModel,
    groupId: number,
    qr?: QueryRunner,
  ): Promise<GroupModel> {
    const groupsRepository = this.getGroupsRepository(qr);

    const group = await groupsRepository.findOne({
      where: {
        churchId: church.id,
        id: groupId,
      },
    });

    if (!group) {
      throw new NotFoundException(GroupException.NOT_FOUND);
    }

    return group;
  }

  private async getAllGroups(church: ChurchModel, qr?: QueryRunner) {
    const allGroupKey = `allGroups-${church.id}`;

    const cachedGroups = await this.cache.get<GroupModel[]>(allGroupKey);

    if (cachedGroups) {
      return cachedGroups;
    }

    const repository = this.getGroupsRepository(qr);

    const allGroups = await repository.find({
      where: {
        churchId: church.id,
      },
      select: {
        id: true,
        childGroupIds: true,
        parentGroupId: true,
      },
    });

    await this.cache.set(allGroupKey, allGroups, 180_000); // 3분 세팅

    return allGroups;
  }

  async findGroupAndDescendantsByIds(
    church: ChurchModel,
    rootGroupIds: number[],
    qr?: QueryRunner,
    isAllGroups?: boolean,
  ): Promise<GroupModel[]> {
    const allGroups = await this.getAllGroups(church, qr);

    if (isAllGroups) {
      return allGroups;
    }

    const groupMap = new Map<number, GroupModel>();
    const parentToChildren = new Map<number, number[]>();

    for (const group of allGroups) {
      groupMap.set(group.id, group);
      const parentId = group.parentGroupId;
      if (parentId !== null) {
        if (!parentToChildren.has(parentId)) {
          parentToChildren.set(parentId, []);
        }
        parentToChildren.get(parentId)!.push(group.id);
      }
    }

    rootGroupIds.forEach((rootGroupId) => {
      if (!groupMap.get(rootGroupId)) {
        throw new NotFoundException(GroupException.NOT_FOUND);
      }
    });

    const visited = new Set<number>();
    const resultIds: number[] = [];
    const queue = [...rootGroupIds];

    while (queue.length > 0) {
      const currentId = queue.shift();
      if (!currentId || visited.has(currentId)) continue;

      visited.add(currentId);
      resultIds.push(currentId);

      const children = parentToChildren.get(currentId) || [];

      queue.push(...children);
    }

    return resultIds.map((id) => groupMap.get(id)!);
  }

  async findChildGroups(
    group: GroupModel,
    qr?: QueryRunner,
  ): Promise<ChildGroup[]> {
    const groupsRepository = this.getGroupsRepository(qr);

    const subGroupsQuery = await groupsRepository.query(
      `
    WITH RECURSIVE group_tree AS (
      -- 초기 그룹의 직계 그룹들
      SELECT id, "parentGroupId", 1 as depth, name
    FROM group_model
    WHERE "parentGroupId" = $1 AND "deletedAt" IS NULL 
    
    UNION ALL 
    
    SELECT g.id, g."parentGroupId", gt.depth + 1, g.name
    FROM group_model g
    INNER JOIN group_tree gt ON g."parentGroupId" = gt.id
    WHERE g."deletedAt" IS NULL
    )
    SELECT id, "parentGroupId", depth, name FROM group_tree
    `,
      [group.id],
    );

    return subGroupsQuery;
  }

  async findGroupByIdWithParents(
    church: ChurchModel,
    groupId: number,
    qr?: QueryRunner,
  ): Promise<ParentGroup[]> {
    const group = await this.findGroupById(church, groupId, qr);

    const parentGroups = await this.findParentGroups(church, group, qr);

    const lastParentGroup =
      parentGroups.length > 0
        ? parentGroups[parentGroups.length - 1]
        : undefined;

    return [
      ...parentGroups,
      {
        id: group.id,
        name: group.name,
        parentGroupId: group.parentGroupId,
        depth: lastParentGroup ? lastParentGroup.depth + 1 : 1,
      },
    ];
  }

  async findParentGroups(
    church: ChurchModel,
    group: GroupModel,
    qr?: QueryRunner,
  ): Promise<ParentGroup[]> {
    const groupsRepository = this.getGroupsRepository(qr);

    const parents = await groupsRepository.query(
      `
    WITH RECURSIVE parent_groups AS (
      -- 초기 그룹의 부모
      SELECT g.* 
      FROM group_model g
      JOIN group_model child 
      ON g.id = child."parentGroupId"
      WHERE child.id = $1 AND child."churchId" = $2
      
      UNION ALL
      
      -- 재귀적으로 부모의 부모 찾기
      SELECT g.*
      FROM group_model g
      JOIN parent_groups pg 
      ON g.id = pg."parentGroupId"
    )
    SELECT * FROM parent_groups;
    `,
      [group.id, church.id],
    );

    let result: ParentGroup[] = [];

    parents.forEach((parent: GroupModel, i: number) => {
      result.unshift({
        id: parent.id,
        name: parent.name,
        parentGroupId: parent.parentGroupId,
        depth: parents.length - i,
      });
    });

    return result;
  }

  async getGroupNameWithHierarchy(
    church: ChurchModel,
    group: GroupModel,
    qr?: QueryRunner,
  ): Promise<string> {
    const parentGroups = await this.findParentGroups(church, group, qr);

    const groupHierarchy = [...parentGroups, group];

    return groupHierarchy.map((group) => group.name).join('__');
  }

  async createGroup(
    church: ChurchModel,
    dto: CreateGroupDto,
    qr: QueryRunner,
  ): Promise<GroupModel> {
    const parentGroup = dto.parentGroupId
      ? await this.findGroupModelById(church, dto.parentGroupId, qr)
      : null;

    const isExistingGroup = await this.isExistGroup(
      church,
      parentGroup,
      dto.name,
      qr,
    );

    if (isExistingGroup) {
      throw new BadRequestException(GroupException.ALREADY_EXIST);
    }

    return parentGroup
      ? this.handleLeafGroup(church, parentGroup, dto, qr)
      : this.handleNodeGroup(church, dto, qr);
  }

  async updateGroupLeader(
    group: GroupModel,
    newLeaderMember: MemberModel | null,
    qr: QueryRunner,
  ): Promise<UpdateResult> {
    if (newLeaderMember) {
      if (newLeaderMember.groupId !== group.id) {
        throw new ConflictException('해당 그룹에 속한 교인이 아닙니다.');
      }

      if (newLeaderMember.groupRole === GroupRole.LEADER) {
        throw new ConflictException('이미 그룹 리더로 지정된 교인입니다.');
      }

      const repository = this.getGroupsRepository(qr);

      const result = await repository.update(
        { id: group.id },
        { leaderMemberId: newLeaderMember.id },
      );

      if (result.affected === 0) {
        throw new InternalServerErrorException(GroupException.UPDATE_ERROR);
      }

      return result;
    }

    const repository = this.getGroupsRepository(qr);

    const result = await repository.update(
      { id: group.id },
      { leaderMemberId: null },
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(GroupException.UPDATE_ERROR);
    }

    return result;
  }

  async removeGroupLeader(
    groups: GroupModel[],
    qr: QueryRunner,
  ): Promise<UpdateResult> {
    const repository = this.getGroupsRepository(qr);

    const groupIds = groups.map((group) => group.id);

    const result = await repository.update(
      {
        id: In(groupIds),
      },
      {
        leaderMemberId: null,
      },
    );

    if (result.affected !== groups.length) {
      throw new InternalServerErrorException(GroupException.UPDATE_ERROR);
    }

    return result;
  }

  async updateGroupStructure(
    church: ChurchModel,
    targetGroup: GroupModel,
    dto: UpdateGroupStructureDto,
    qr: QueryRunner,
    newParentGroup: GroupModel | null,
  ): Promise<UpdateResult> {
    // 계층 이동 시 가능한 이름인지 확인
    if (dto.parentGroupId !== undefined) {
      const isExist = await this.isExistGroup(
        church,
        newParentGroup,
        targetGroup.name,
        qr,
      );

      if (isExist) {
        throw new ConflictException(GroupException.ALREADY_EXIST);
      }

      // 새로운 상위 그룹으로 이동
      if (dto.parentGroupId && newParentGroup) {
        await this.validateUpdateHierarchy(
          church,
          targetGroup,
          newParentGroup,
          qr,
        );
      }

      await this.appendChildGroupId(targetGroup, newParentGroup, qr);
      await this.removeChildGroupId(targetGroup, targetGroup.parentGroup, qr);
    }

    const groupsRepository = this.getGroupsRepository(qr);

    if (dto.order) {
      const parentGroupId =
        dto.parentGroupId === undefined
          ? (targetGroup.parentGroupId ?? IsNull())
          : (dto.parentGroupId ?? IsNull());

      const lastOrderGroup = await groupsRepository.findOne({
        where: {
          churchId: church.id,
          parentGroupId,
        },
        order: {
          order: 'desc',
        },
      });

      const lastOrder = lastOrderGroup ? lastOrderGroup.order : 1;

      if (dto.parentGroupId === undefined && dto.order > lastOrder) {
        throw new BadRequestException(GroupException.INVALID_ORDER);
      } else if (dto.parentGroupId !== undefined && dto.order > lastOrder + 1) {
        throw new BadRequestException(GroupException.INVALID_ORDER);
      }

      // 계층이 변하는 경우
      if (dto.parentGroupId !== undefined) {
        await groupsRepository.update(
          {
            churchId: church.id,
            parentGroupId:
              targetGroup.parentGroupId === null
                ? IsNull()
                : targetGroup.parentGroupId,
            order: MoreThanOrEqual(targetGroup.order),
          },
          {
            order: () => 'order - 1',
          },
        );

        await groupsRepository.update(
          {
            churchId: church.id,
            parentGroupId: parentGroupId,
            order: MoreThanOrEqual(dto.order),
          },
          {
            order: () => 'order + 1',
          },
        );
      } else {
        const isMovingDown = dto.order > targetGroup.order;
        const [from, to] = isMovingDown
          ? [targetGroup.order + 1, dto.order]
          : [dto.order, targetGroup.order - 1];

        await groupsRepository.update(
          {
            churchId: church.id,
            parentGroupId,
            order: Between(from, to),
          },
          {
            order: () => (isMovingDown ? 'order - 1' : 'order + 1'),
          },
        );
      }
    }

    // 업데이트 수행
    const result = await groupsRepository.update(
      {
        id: targetGroup.id,
      },
      {
        order: dto.order,
        parentGroupId: newParentGroup === null ? null : dto.parentGroupId,
      },
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(GroupException.UPDATE_ERROR);
    }

    return result;
  }

  async updateGroupName(
    church: ChurchModel,
    targetGroup: GroupModel,
    dto: UpdateGroupNameDto,
    qr: QueryRunner,
  ): Promise<UpdateResult> {
    if (targetGroup.parentGroupId && !targetGroup.parentGroup) {
      throw new InternalServerErrorException('상위 그룹 불러오기 실패');
    }

    const isExist = await this.isExistGroup(
      church,
      targetGroup.parentGroup,
      dto.name,
      qr,
    );

    if (isExist) {
      throw new ConflictException(GroupException.ALREADY_EXIST);
    }

    const repository = this.getGroupsRepository(qr);

    const result = await repository.update(
      { id: targetGroup.id },
      { name: dto.name },
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(GroupException.UPDATE_ERROR);
    }

    return result;
  }

  async deleteGroup(deleteTarget: GroupModel, qr: QueryRunner): Promise<void> {
    const groupsRepository = this.getGroupsRepository(qr);

    if (
      deleteTarget.childGroupIds.length > 0 ||
      deleteTarget.membersCount > 0
    ) {
      throw new BadRequestException(GroupException.GROUP_HAS_DEPENDENCIES);
    }

    await groupsRepository.softRemove(deleteTarget);

    await groupsRepository.update(
      {
        churchId: deleteTarget.churchId,
        parentGroupId: deleteTarget.parentGroupId
          ? deleteTarget.parentGroupId
          : IsNull(),
        deletedAt: IsNull(),
        order: MoreThan(deleteTarget.order),
      },
      {
        order: () => 'order - 1',
      },
    );

    // 부모 그룹의 자식 그룹 ID 배열 업데이트
    await this.removeChildGroupId(deleteTarget, deleteTarget.parentGroup, qr);

    return;
  }

  async incrementMembersCount(
    group: GroupModel,
    count: number,
    qr: QueryRunner,
  ): Promise<UpdateResult> {
    const groupsRepository = this.getGroupsRepository(qr);

    const result = await groupsRepository.increment(
      { id: group.id },
      'membersCount',
      count,
    );

    if (result.affected === 0) {
      throw new NotFoundException(GroupException.NOT_FOUND);
    }

    return result;
  }

  async decrementMembersCount(
    group: GroupModel,
    count: number,
    qr: QueryRunner,
  ): Promise<UpdateResult> {
    const groupsRepository = this.getGroupsRepository(qr);

    const result = await groupsRepository.decrement(
      { id: group.id, deletedAt: IsNull() },
      'membersCount',
      count,
    );

    if (result.affected === 0) {
      throw new NotFoundException(GroupException.NOT_FOUND);
    }

    return result;
  }

  async refreshMembersCount(
    group: GroupModel,
    membersCount: number,
    qr?: QueryRunner,
  ): Promise<UpdateResult> {
    const repository = this.getGroupsRepository(qr);

    const result = await repository.update({ id: group.id }, { membersCount });
    if (result.affected === 0) {
      throw new InternalServerErrorException(GroupException.UPDATE_ERROR);
    }

    return result;
  }

  private async handleNodeGroup(
    church: ChurchModel,
    dto: CreateGroupDto,
    qr: QueryRunner,
  ) {
    const groupsRepository = this.getGroupsRepository(qr);

    const lastOrderGroup = await groupsRepository.findOne({
      where: {
        churchId: church.id,
      },
      order: {
        order: 'DESC',
      },
    });

    const order = lastOrderGroup ? lastOrderGroup.order + 1 : 1;

    return groupsRepository.save({
      churchId: church.id,
      ...dto,
      order,
    });
  }

  private async handleLeafGroup(
    church: ChurchModel,
    parentGroup: GroupModel,
    dto: CreateGroupDto,
    qr: QueryRunner,
  ) {
    const groupsRepository = this.getGroupsRepository(qr);

    const grandParentGroups = await this.findParentGroups(
      church,
      parentGroup,
      qr,
    );

    // 그룹의 depth 는 5 를 넘을 수 없음.
    if (grandParentGroups.length + 1 === 5) {
      throw new BadRequestException(GroupException.LIMIT_DEPTH_REACHED);
    }

    const lastOrderGroup = await groupsRepository.findOne({
      where: {
        churchId: church.id,
        parentGroupId: parentGroup.id,
      },
      order: {
        order: 'DESC',
      },
    });

    const order = lastOrderGroup ? lastOrderGroup.order + 1 : 1;

    const newGroup = await groupsRepository.save({
      churchId: church.id,
      ...dto,
      order,
    });

    await this.appendChildGroupId(newGroup, parentGroup, qr);

    return newGroup;
  }

  private async appendChildGroupId(
    childGroup: GroupModel,
    parentGroup: GroupModel | null,
    qr: QueryRunner,
  ) {
    if (parentGroup === null) {
      return;
    }

    const groupsRepository = this.getGroupsRepository(qr);

    // 부모 그룹에 새로운 자식 그룹 추가
    await groupsRepository
      .createQueryBuilder(undefined, qr)
      .update()
      .set({
        childGroupIds: () => `array_append("childGroupIds", :childGroupId)`,
      })
      .where('id= :id', { id: parentGroup.id })
      .setParameters({ childGroupId: childGroup.id })
      .execute();
  }

  private async removeChildGroupId(
    childGroup: GroupModel,
    parentGroup: GroupModel | null,
    qr: QueryRunner,
  ) {
    if (parentGroup === null) {
      return;
    }

    const groupsRepository = this.getGroupsRepository(qr);

    await groupsRepository
      .createQueryBuilder(undefined, qr)
      .update()
      .set({
        childGroupIds: () => `array_remove("childGroupIds", :childGroupId)`,
      })
      .where('id = :id', { id: parentGroup.id })
      .setParameters({
        childGroupId: childGroup.id,
      })
      .execute();
  }

  private async validateUpdateHierarchy(
    church: ChurchModel,
    targetGroup: GroupModel,
    newParentGroup: GroupModel,
    qr: QueryRunner,
  ) {
    const allChildGroups = await this.findChildGroups(targetGroup, qr);

    const allChildGroupIds = allChildGroups.map((group) => group.id);

    const maxChildGroupDepth =
      allChildGroupIds.length > 0
        ? Math.max(...allChildGroups.map((group) => group.depth))
        : 0;

    // 계층 역전 확인
    if (allChildGroupIds.includes(newParentGroup.id)) {
      throw new BadRequestException(
        GroupException.CANNOT_SET_SUBGROUP_AS_PARENT,
      );
    }

    const newParentDepth = (
      await this.findParentGroups(church, newParentGroup, qr)
    )
      .map((group) => group.id)
      .push(newParentGroup.id);

    // 새 상위 그룹의 depth 와 타겟 그룹의 depth 의 합이 5 를 넘는지 확인
    const newDepth = newParentDepth + maxChildGroupDepth + 1;

    if (newDepth > GroupDepthConstraint.MAX_DEPTH) {
      throw new BadRequestException(GroupException.LIMIT_DEPTH_REACHED);
    }
  }
}
