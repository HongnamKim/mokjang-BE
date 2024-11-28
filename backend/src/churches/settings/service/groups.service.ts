import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GroupModel } from '../entity/group.entity';
import { QueryRunner, Repository } from 'typeorm';
import { ChurchesService } from '../../churches.service';
import { CreateGroupDto } from '../dto/group/create-group.dto';
import { UpdateGroupDto } from '../dto/group/update-group.dto';
import { SETTING_EXCEPTION } from '../const/exception-messages.const';

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
    });
  }

  async postGroup(churchId: number, dto: CreateGroupDto, qr?: QueryRunner) {
    await this.checkChurchExist(churchId, qr);

    if (await this.isExistGroup(churchId, dto.name, qr)) {
      throw new BadRequestException(SETTING_EXCEPTION.GROUP.ALREADY_EXIST);
    }

    const groupsRepository = this.getGroupRepository(qr);

    // 상위 그룹 지정 시
    if (dto.parentGroupId) {
      const parentGroup = await groupsRepository.findOne({
        where: {
          id: dto.parentGroupId,
          churchId: churchId,
        },
      });

      if (!parentGroup) {
        throw new NotFoundException(SETTING_EXCEPTION.GROUP.NOT_FOUND(true));
      }

      const newGroup = await groupsRepository.save({
        churchId: churchId,
        ...dto,
      });

      await groupsRepository
        .createQueryBuilder()
        .update()
        .set({
          childGroupIds: () => `array_append("childGroupIds", ${newGroup.id})`,
        })
        .where('id= :id', { id: parentGroup.id })
        .execute();

      return newGroup;
    }

    // 상위 그룹이 없는 경우
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

    if (dto.name && (await this.isExistGroup(churchId, dto.name, qr))) {
      throw new BadRequestException(SETTING_EXCEPTION.GROUP.ALREADY_EXIST);
    }

    const groupRepository = this.getGroupRepository(qr);

    // 상위 그룹을 변경하는 경우
    if (dto.parentGroupId) {
      // 변경하려는 상위 그룹이 있는지
      const newParentGroup = await groupRepository.findOne({
        where: { id: dto.parentGroupId },
      });

      if (!newParentGroup) {
        throw new NotFoundException(SETTING_EXCEPTION.GROUP.NOT_FOUND(true));
      }

      /**
       * 기존 상위 그룹에서 하위 그룹 id 제거,
       * 새 상위 그룹에 하위 그룹 id 추가,
       * 하위 그룹 업데이트
       */

      // 변경 전 그룹
      const beforeUpdateGroup = await groupRepository.findOne({
        where: { id: groupId },
      });

      // 변경 대상 그룹을 현재 자신의 하위 그룹과 종속 관계를 바꾸려는 경우
      // A -> B 관계를 직접 A <- B 로 바꾸려는 경우
      // 컴퓨터의 폴더 구조와 동일한 방식
      if (beforeUpdateGroup.childGroupIds.includes(dto.parentGroupId)) {
        throw new BadRequestException(
          '현재 하위 그룹을 새로운 상위 그룹으로 지정할 수 없습니다.',
        );
      }

      // 기존 상위 그룹 관계 해제
      await groupRepository
        .createQueryBuilder()
        .update()
        .set({
          childGroupIds: () =>
            `array_remove("childGroupIds", ${beforeUpdateGroup.id})`,
        })
        .where('id = :id', { id: beforeUpdateGroup.parentGroupId })
        .execute();

      // 새로운 상위 그룹 관계 추가
      await groupRepository
        .createQueryBuilder()
        .update()
        .set({
          childGroupIds: () =>
            `array_append("childGroupIds", ${beforeUpdateGroup.id})`,
        })
        .where('id = :id', { id: dto.parentGroupId })
        .execute();

      const result = await groupRepository.update(
        {
          id: groupId,
        },
        {
          parentGroupId: newParentGroup.id,
          name: dto.name,
        },
      );

      if (result.affected === 0) {
        throw new NotFoundException(SETTING_EXCEPTION.GROUP.NOT_FOUND(false));
      }

      return await groupRepository.findOne({ where: { id: groupId } });
    }

    const result = await groupRepository.update(
      {
        id: groupId,
      },
      {
        name: dto.name,
      },
    );

    if (result.affected === 0) {
      throw new NotFoundException(SETTING_EXCEPTION.GROUP.NOT_FOUND(false));
    }

    return await groupRepository.findOne({ where: { id: groupId } });
  }

  async deleteGroup(churchId: number, groupId: number) {}
}
