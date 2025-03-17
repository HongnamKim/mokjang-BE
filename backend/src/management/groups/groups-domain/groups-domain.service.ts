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
} from './interface/groups-domain.service.interface';
import { ChurchModel } from '../../../churches/entity/church.entity';
import { CreateGroupDto } from '../dto/create-group.dto';
import { FindOptionsRelations, IsNull, QueryRunner, Repository } from 'typeorm';
import { GroupModel } from '../entity/group.entity';
import { UpdateGroupDto } from '../dto/update-group.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { GroupException } from '../const/exception/group.exception';

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
    churchId: number,
    groupName: string,
    qr?: QueryRunner,
    parentGroupId?: number,
  ) {
    const groupsRepository = this.getGroupsRepository(qr);

    const existingGroup = await groupsRepository.findOne({
      where: {
        churchId,
        parentGroupId: parentGroupId ? parentGroupId : IsNull(),
        name: groupName,
      },
    });

    return !!existingGroup;
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

  async createGroup(
    church: ChurchModel,
    dto: CreateGroupDto,
    qr: QueryRunner,
  ): Promise<GroupModel> {
    const isExistingGroup = await this.isExistGroup(
      church.id,
      dto.name,
      qr,
      dto.parentGroupId,
    );

    if (isExistingGroup) {
      throw new BadRequestException(GroupException.ALREADY_EXIST);
    }

    if (dto.parentGroupId) {
      return this.handleLeafGroup(church, dto, qr);
    }

    return dto.parentGroupId
      ? this.handleLeafGroup(church, dto, qr)
      : this.handleNodeGroup(church, dto, qr);
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

  async deleteGroup(
    churchId: number,
    groupId: number,
    qr: QueryRunner,
  ): Promise<string> {
    const groupsRepository = this.getGroupsRepository(qr);

    //const deleteTarget = await this.findGroupModelById(churchId, groupId, qr);

    const deleteTarget = await this.groupsRepository.findOne({
      where: {
        id: groupId,
        churchId,
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
    await groupsRepository
      .createQueryBuilder(undefined, qr)
      .update()
      .set({
        childGroupIds: () => `array_remove("childGroupIds", :deleteTargetId)`,
      })
      .where('id = :id', { id: deleteTarget.parentGroupId })
      .setParameters({
        deleteTargetId: deleteTarget.id,
      })
      .execute();

    return `groupId ${groupId} deleted`;
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

  async findGroups(church: ChurchModel): Promise<GroupModel[]> {
    const groupsRepository = this.getGroupsRepository();

    return groupsRepository.find({
      where: {
        churchId: church.id,
      },
      relations: { groupRoles: true },
      order: { createdAt: 'ASC' },
    });
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

  async updateGroup(
    churchId: number,
    groupId: number,
    dto: UpdateGroupDto,
    qr: QueryRunner,
  ): Promise<GroupModel> {
    const groupsRepository = this.getGroupsRepository(qr);

    const updateTargetGroup = await groupsRepository.findOne({
      where: { churchId, id: groupId },
      relations: {
        parentGroup: true,
      },
    });

    if (!updateTargetGroup) {
      throw new NotFoundException(GroupException.NOT_FOUND);
    }

    // 그룹 이름을 변경하는 경우 중복 확인
    if (
      dto.name &&
      (await this.isExistGroup(churchId, dto.name, qr, dto.parentGroupId))
    ) {
      throw new BadRequestException(GroupException.ALREADY_EXIST);
    }

    if (dto.parentGroupId) {
      /*const newParentGroup = await this.findGroupModelById(
        churchId,
        groupId,
        qr,
      );*/

      const newParentGroup = await groupsRepository.findOne({
        where: {
          id: dto.parentGroupId,
          churchId,
        },
      });

      if (!newParentGroup) {
        throw new NotFoundException(GroupException.NOT_FOUND);
      }

      // 종속 관계를 역전시키려는 경우
      // A -> B 관계를 직접 A <- B 로 바꾸려는 경우
      if (updateTargetGroup.childGroupIds.includes(dto.parentGroupId)) {
        throw new BadRequestException(
          GroupException.CANNOT_SET_SUBGROUP_AS_PARENT,
        );
      }

      // 이전 상위 그룹, 새로운 상위 그룹의 childGroupId 수정
      await Promise.all([
        this.addChildGroupId(updateTargetGroup, newParentGroup, qr),
        this.removeChildGroupId(
          updateTargetGroup,
          updateTargetGroup.parentGroup,
          qr,
        ),
        /*groupsRepository
          .createQueryBuilder(undefined, qr)
          .update()
          .set({
            childGroupIds: () =>
              `array_remove("childGroupIds", :beforeUpdateGroupId)`,
          })
          .where('id = :id', { id: beforeUpdateGroup.parentGroupId })
          .setParameters({
            beforeUpdateGroupId: beforeUpdateGroup.id,
          })
          .execute(),
        groupsRepository
          .createQueryBuilder(undefined, qr)
          .update()
          .set({
            childGroupIds: () =>
              `array_append("childGroupIds", :beforeUpdateGroupId)`,
          })
          .where('id = :id', { id: dto.parentGroupId })
          .setParameters({
            beforeUpdateGroupId: beforeUpdateGroup.id,
          })
          .execute(),*/
      ]);
    }

    // 업데이트 수행
    const result = await groupsRepository.update(
      {
        id: groupId,
        deletedAt: IsNull(),
      },
      {
        ...dto,
      },
    );

    if (result.affected === 0) {
      throw new NotFoundException(GroupException.NOT_FOUND);
    }

    const updatedGroup = await groupsRepository.findOne({
      where: { id: groupId },
    });

    if (!updatedGroup) {
      throw new InternalServerErrorException('그룹 업데이트 중 에러 발생');
    }

    return updatedGroup;
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
    dto: CreateGroupDto,
    qr: QueryRunner,
  ) {
    const groupsRepository = this.getGroupsRepository(qr);

    /*const parentGroup = await this.findGroupModelById(
      church.id,
      dto.parentGroupId,
      qr,
    );*/
    const parentGroup = await groupsRepository.findOne({
      where: {
        id: dto.parentGroupId,
        churchId: church.id,
      },
    });

    if (!parentGroup) {
      throw new NotFoundException(GroupException.NOT_FOUND);
    }

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

    await this.addChildGroupId(newGroup, parentGroup, qr);

    /*// 부모 그룹에 새로운 자식 그룹 추가
    await groupsRepository
      .createQueryBuilder(undefined, qr)
      .update()
      .set({
        childGroupIds: () => `array_append("childGroupIds", :newGroupId)`,
      })
      .where('id= :id', { id: parentGroup.id })
      .setParameters({ newGroupId: newGroup.id })
      .execute();*/

    return newGroup;
  }

  private async addChildGroupId(
    childGroup: GroupModel,
    parentGroup: GroupModel,
    qr: QueryRunner,
  ) {
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
    parentGroup: GroupModel,
    qr: QueryRunner,
  ) {
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
