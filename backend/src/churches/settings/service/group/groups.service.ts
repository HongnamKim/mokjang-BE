import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GroupModel } from '../../entity/group/group.entity';
import { FindOptionsRelations, IsNull, QueryRunner, Repository } from 'typeorm';
import { ChurchesService } from '../../../churches.service';
import { CreateGroupDto } from '../../dto/group/create-group.dto';
import { UpdateGroupDto } from '../../dto/group/update-group.dto';
import { SETTING_EXCEPTION } from '../../exception-messages/exception-messages.const';
import { GroupExceptionMessage } from '../../const/exception/group/group.exception';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(GroupModel)
    private readonly groupsRepository: Repository<GroupModel>,

    private readonly churchesService: ChurchesService,
  ) {}

  private getGroupRepository(qr?: QueryRunner) {
    return qr ? qr.manager.getRepository(GroupModel) : this.groupsRepository;
  }

  private async checkChurchExist(churchId: number, qr?: QueryRunner) {
    const isExistChurch = await this.churchesService.isExistChurch(
      churchId,
      qr,
    );

    if (!isExistChurch) {
      throw new NotFoundException('해당 교회를 찾을 수 없습니다.');
    }
  }

  private async isExistGroup(churchId: number, name: string, qr?: QueryRunner) {
    const groupsRepository = this.getGroupRepository(qr);

    const group = await groupsRepository.findOne({
      where: {
        churchId,
        name,
      },
    });

    return !!group;
  }

  async getGroups(churchId: number) {
    await this.checkChurchExist(churchId);

    return this.groupsRepository.find({
      where: { churchId },
      relations: { groupRoles: true },
      order: { createdAt: 'ASC' },
    });
  }

  async getGroupModelById(
    churchId: number,
    groupId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<GroupModel>,
  ) {
    const groupsRepository = this.getGroupRepository(qr);

    const group = await groupsRepository.findOne({
      where: {
        id: groupId,
        churchId,
      },
      relations: {
        ...relationOptions,
      },
    });

    if (!group) {
      throw new NotFoundException(GroupExceptionMessage.NOT_FOUND);
    }

    return group;
  }

  async getGroupByIdWithParents(
    churchId: number,
    groupId: number,
    qr?: QueryRunner,
  ) {
    await this.checkChurchExist(churchId, qr);

    const groupsRepository = this.getGroupRepository(qr);

    const group = await groupsRepository.findOne({
      where: { churchId, id: groupId },
      relations: { groupRoles: true },
    });

    if (!group) {
      throw new NotFoundException(GroupExceptionMessage.NOT_FOUND);
    }

    return {
      ...group,
      parentGroups: await this.getParentGroups(churchId, groupId, qr),
    };
  }

  async getParentGroups(
    churchId: number,
    groupId: number,
    qr?: QueryRunner,
    //groupsRepository: Repository<GroupModel>,
  ) {
    const groupsRepository = this.getGroupRepository(qr);

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
      [groupId, churchId],
    );

    let result: {
      id: number;
      name: string;
      parentGroupId: number | null;
      depth: number;
    }[] = [];
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

  async postGroup(churchId: number, dto: CreateGroupDto, qr?: QueryRunner) {
    await this.checkChurchExist(churchId, qr);

    if (await this.isExistGroup(churchId, dto.name, qr)) {
      throw new BadRequestException(GroupExceptionMessage.ALREADY_EXIST);
    }

    const groupsRepository = this.getGroupRepository(qr);

    // 상위 그룹 지정 시
    if (dto.parentGroupId) {
      const parentGroup = await this.getGroupModelById(
        churchId,
        dto.parentGroupId,
        qr,
      );

      const grandParentGroups = await this.getParentGroups(
        churchId,
        parentGroup.id,
        qr,
      );

      if (grandParentGroups.length + 1 === 5) {
        throw new BadRequestException(
          GroupExceptionMessage.LIMIT_DEPTH_REACHED,
        );
      }

      const newGroup = await groupsRepository.save({
        churchId: churchId,
        ...dto,
      });

      // 상위 그룹에 새로운 그룹 추가
      await groupsRepository
        .createQueryBuilder(undefined, qr)
        .update()
        .set({
          childGroupIds: () => `array_append("childGroupIds", :newGroupId)`,
        })
        .where('id= :id', { id: parentGroup.id })
        .setParameters({ newGroupId: newGroup.id })
        .execute();

      return newGroup;
    }

    // 새로운 그룹 추가
    return groupsRepository.save({
      churchId: churchId,
      ...dto,
    });
  }

  async updateGroup(
    churchId: number,
    groupId: number,
    dto: UpdateGroupDto,
    qr?: QueryRunner,
  ) {
    await this.checkChurchExist(churchId, qr);

    // 그룹 이름을 변경하는 경우 중복 확인
    if (dto.name && (await this.isExistGroup(churchId, dto.name, qr))) {
      throw new BadRequestException(SETTING_EXCEPTION.GroupModel.ALREADY_EXIST);
    }

    const groupRepository = this.getGroupRepository(qr);

    // 변경 전 그룹
    const beforeUpdateGroup = await this.getGroupModelById(
      churchId,
      groupId,
      qr,
    );

    // 상위 그룹을 변경하는 경우
    if (dto.parentGroupId) {
      // 변경하려는 상위 그룹이 있는지
      const newParentGroup = await groupRepository.findOne({
        where: { id: dto.parentGroupId },
      });

      if (!newParentGroup) {
        throw new NotFoundException(
          SETTING_EXCEPTION.GroupModel.PARENT_NOT_FOUND,
        );
      }

      // 변경 대상 그룹을 현재 자신의 하위 그룹과 종속 관계를 바꾸려는 경우
      // A -> B 관계를 직접 A <- B 로 바꾸려는 경우
      // 컴퓨터의 폴더 구조와 동일한 방식
      if (beforeUpdateGroup.childGroupIds.includes(dto.parentGroupId)) {
        throw new BadRequestException(
          GroupExceptionMessage.CANNOT_SET_SUBGROUP_AS_PARENT,
        );
      }

      // 이전 상위 그룹, 새로운 상위 그룹의 childGroupId 수정
      await Promise.all([
        groupRepository
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
        groupRepository
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
          .execute(),
      ]);
    }

    // 업데이트 수행
    const result = await groupRepository.update(
      {
        id: groupId,
        deletedAt: IsNull(),
      },
      {
        ...dto,
      },
    );

    if (result.affected === 0) {
      throw new NotFoundException(SETTING_EXCEPTION.GroupModel.NOT_FOUND);
    }

    return await groupRepository.findOne({ where: { id: groupId } });
  }

  async deleteGroup(
    churchId: number,
    groupId: number,
    //cascade: boolean,
    qr?: QueryRunner,
  ) {
    await this.checkChurchExist(churchId);

    const groupsRepository = this.getGroupRepository(qr);

    const deleteTarget = await groupsRepository.findOne({
      where: { id: groupId },
    });

    if (!deleteTarget) {
      throw new NotFoundException(SETTING_EXCEPTION.GroupModel.NOT_FOUND);
    }

    if (
      deleteTarget.childGroupIds.length > 0 ||
      deleteTarget.membersCount !== 0
    ) {
      throw new BadRequestException(
        GroupExceptionMessage.GROUP_HAS_DEPENDENCIES,
      );
    }

    const result = await groupsRepository.softDelete({
      id: groupId,
      churchId,
      deletedAt: IsNull(),
    });

    if (result.affected === 0) {
      throw new NotFoundException(SETTING_EXCEPTION.GroupModel.NOT_FOUND);
    }

    await this.groupsRepository
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

    return 'ok';
  }

  async getGroupsCascade(groupId: number, qr?: QueryRunner) {
    const groupsRepository = this.getGroupRepository(qr);

    const group = await groupsRepository.findOne({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException(SETTING_EXCEPTION.GroupModel.NOT_FOUND);
    }

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

    return subGroupsQuery.map((row: any) => row.id);
  }

  async incrementMembersCount(groupId: number, qr: QueryRunner) {
    const groupsRepository = this.getGroupRepository(qr);

    const result = await groupsRepository.increment(
      { id: groupId },
      'membersCount',
      1,
    );

    if (result.affected === 0) {
      throw new NotFoundException(SETTING_EXCEPTION.GroupModel.NOT_FOUND);
    }

    return true;
  }

  async decrementMembersCount(groupId: number, qr: QueryRunner) {
    const groupsRepository = this.getGroupRepository(qr);

    const result = await groupsRepository.decrement(
      { id: groupId },
      'membersCount',
      1,
    );

    if (result.affected === 0) {
      throw new NotFoundException(SETTING_EXCEPTION.GroupModel.NOT_FOUND);
    }

    return true;
  }
}
