import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  GroupModelWithParentGroups,
  IGroupsDomainService,
  ParentGroup,
} from '../interface/groups-domain.service.interface';
import { ChurchModel } from '../../../../churches/entity/church.entity';
import { CreateGroupDto } from '../../dto/create-group.dto';
import { FindOptionsRelations, IsNull, QueryRunner, Repository } from 'typeorm';
import { GroupModel } from '../../entity/group.entity';
import { UpdateGroupDto } from '../../dto/update-group.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { GroupException } from '../../const/exception/group.exception';
import { GroupDepthConstraint } from '../../../const/group-depth.constraint';

@Injectable()
export class GroupsDomainService implements IGroupsDomainService {
  constructor(
    @InjectRepository(GroupModel)
    private readonly groupsRepository: Repository<GroupModel>,
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

  async findGroups(church: ChurchModel): Promise<GroupModel[]> {
    const groupsRepository = this.getGroupsRepository();

    return groupsRepository.find({
      where: {
        churchId: church.id,
      },
      //relations: { groupRoles: true },
      order: { createdAt: 'ASC' },
    });
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
      relations: {
        groupRoles: true,
      },
    });

    if (!group) {
      throw new NotFoundException(GroupException.NOT_FOUND);
    }

    return group;
  }

  async findChildGroupIds(
    group: GroupModel,
    qr?: QueryRunner,
  ): Promise<number[]> {
    const groupsRepository = this.getGroupsRepository(qr);

    const subGroupsQuery = await groupsRepository.query(
      `
    WITH RECURSIVE group_tree AS (
      -- 초기 그룹의 직계 그룹들
      SELECT id, "parentGroupId", 1 as level, name
    FROM group_model
    WHERE "parentGroupId" = $1 AND "deletedAt" IS NULL 
    
    UNION ALL 
    
    SELECT g.id, g."parentGroupId", gt.level + 1, g.name
    FROM group_model g
    INNER JOIN group_tree gt ON g."parentGroupId" = gt.id
    WHERE g."deletedAt" IS NULL
    )
    SELECT id, level, name FROM group_tree
    `,
      [group.id],
    );

    return subGroupsQuery.map((row: any) => row.id as number);
  }

  async findGroupByIdWithParents(
    church: ChurchModel,
    groupId: number,
    qr?: QueryRunner,
  ): Promise<GroupModelWithParentGroups> {
    const group = await this.findGroupById(church, groupId, qr);

    return {
      ...group,
      parentGroups: await this.findParentGroups(church, group, qr),
    };
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

  async updateGroup(
    church: ChurchModel,
    targetGroup: GroupModel,
    dto: UpdateGroupDto,
    qr: QueryRunner,
    newParentGroup: GroupModel | null,
  ): Promise<GroupModel> {
    const newName = dto.name ?? targetGroup.name;

    // 계층 이동 또는 이름 변경 시 가능한 이름인지 확인
    const isExist = await this.isExistGroup(
      church,
      newParentGroup,
      newName,
      qr,
    );

    if (isExist) {
      throw new BadRequestException(GroupException.ALREADY_EXIST);
    }

    // 새로운 상위 그룹으로 이동
    if (
      newParentGroup !== null && // 다른 상위 그룹을 지정
      newParentGroup.id !== targetGroup.parentGroupId // 기존 상위 그룹과 다른 경우
    ) {
      // 계층 역전 확인
      if (targetGroup.childGroupIds.includes(newParentGroup.id)) {
        throw new BadRequestException(
          GroupException.CANNOT_SET_SUBGROUP_AS_PARENT,
        );
      }

      const newGrandParentGroups = await this.findParentGroups(
        church,
        newParentGroup,
        qr,
      );

      // 새 상위 그룹의 depth 와 타겟 그룹의 depth 의 합이 5 를 넘는지 확인
      const newDepth =
        newGrandParentGroups.length + targetGroup.childGroupIds.length + 2;

      if (newDepth >= GroupDepthConstraint.MAX_DEPTH) {
        throw new BadRequestException(GroupException.LIMIT_DEPTH_REACHED);
      }
    }

    // 계층을 이동하는 경우 (최상위 계층으로 이동 포함)
    if (dto.parentGroupId !== undefined) {
      // newParentGroup 이 null 또는 새로운 상위 그룹
      await Promise.all([
        this.appendChildGroupId(targetGroup, newParentGroup, qr),
        this.removeChildGroupId(targetGroup, targetGroup.parentGroup, qr),
      ]);
    }

    /*if (dto.parentGroupId) {
      // 종속 관계를 역전시키려는 경우
      // A -> B 관계를 직접 A <- B 로 바꾸려는 경우
      if (targetGroup.childGroupIds.includes(dto.parentGroupId)) {
        throw new BadRequestException(
          GroupException.CANNOT_SET_SUBGROUP_AS_PARENT,
        );
      }

      if (newParentGroup) {
        // 이전 상위 그룹, 새로운 상위 그룹의 childGroupId 수정
        await Promise.all([
          this.appendChildGroupId(targetGroup, newParentGroup, qr),
          this.removeChildGroupId(targetGroup, targetGroup.parentGroup, qr),
        ]);
      }
    }*/

    const groupsRepository = this.getGroupsRepository(qr);
    // 업데이트 수행
    const result = await groupsRepository.update(
      {
        id: targetGroup.id,
        deletedAt: IsNull(),
      },
      {
        name: dto.name,
        parentGroupId: newParentGroup === null ? null : dto.parentGroupId,
      },
    );

    if (result.affected === 0) {
      throw new NotFoundException(GroupException.UPDATE_ERROR);
    }

    const updatedGroup = await groupsRepository.findOne({
      where: { id: targetGroup.id },
    });

    if (!updatedGroup) {
      throw new InternalServerErrorException('그룹 업데이트 중 에러 발생');
    }

    return updatedGroup;
  }

  async deleteGroup(
    churchId: number,
    groupId: number,
    qr: QueryRunner,
  ): Promise<string> {
    const groupsRepository = this.getGroupsRepository(qr);

    const deleteTarget = await this.groupsRepository.findOne({
      where: {
        id: groupId,
        churchId,
      },
      relations: {
        parentGroup: true,
      },
    });

    if (!deleteTarget) {
      throw new NotFoundException(GroupException.NOT_FOUND);
    }

    if (
      deleteTarget.childGroupIds.length > 0 ||
      deleteTarget.membersCount > 0
    ) {
      throw new BadRequestException(GroupException.GROUP_HAS_DEPENDENCIES);
    }

    await groupsRepository.softRemove(deleteTarget);

    // 부모 그룹의 자식 그룹 ID 배열 업데이트
    await this.removeChildGroupId(deleteTarget, deleteTarget.parentGroup, qr);

    return `groupId ${groupId} deleted`;
  }

  async incrementMembersCount(
    group: GroupModel,
    qr: QueryRunner,
  ): Promise<boolean> {
    const groupsRepository = this.getGroupsRepository(qr);

    const result = await groupsRepository.increment(
      { id: group.id },
      'membersCount',
      1,
    );

    if (result.affected === 0) {
      throw new NotFoundException(GroupException.NOT_FOUND);
    }

    return true;
  }

  async decrementMembersCount(
    group: GroupModel,
    qr: QueryRunner,
  ): Promise<boolean> {
    const groupsRepository = this.getGroupsRepository(qr);

    const result = await groupsRepository.decrement(
      { id: group.id, deletedAt: IsNull() },
      'membersCount',
      1,
    );

    if (result.affected === 0) {
      throw new NotFoundException(GroupException.NOT_FOUND);
    }

    return true;
  }

  private async handleNodeGroup(
    church: ChurchModel,
    dto: CreateGroupDto,
    qr: QueryRunner,
  ) {
    const groupsRepository = this.getGroupsRepository(qr);

    return groupsRepository.save({
      churchId: church.id,
      ...dto,
    });
  }

  private async handleLeafGroup(
    church: ChurchModel,
    parentGroup: GroupModel,
    dto: CreateGroupDto,
    qr: QueryRunner,
  ) {
    const groupsRepository = this.getGroupsRepository(qr);

    /*const parentGroup = await groupsRepository.findOne({
      where: {
        id: dto.parentGroupId,
        churchId: church.id,
      },
    });

    if (!parentGroup) {
      throw new NotFoundException(GroupException.NOT_FOUND);
    }*/

    const grandParentGroups = await this.findParentGroups(
      church,
      parentGroup,
      qr,
    );

    // 그룹의 depth 는 5 를 넘을 수 없음.
    if (grandParentGroups.length + 1 === 5) {
      throw new BadRequestException(GroupException.LIMIT_DEPTH_REACHED);
    }

    const newGroup = await groupsRepository.save({
      churchId: church.id,
      ...dto,
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
}
