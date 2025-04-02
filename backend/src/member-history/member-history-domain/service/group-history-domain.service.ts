import { IGroupHistoryDomainService } from './interface/group-history-domain.service.interface';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GroupHistoryModel } from '../../entity/group-history.entity';
import {
  FindOptionsRelations,
  IsNull,
  QueryRunner,
  Repository,
  UpdateResult,
} from 'typeorm';
import { MemberModel } from '../../../members/entity/member.entity';
import { GetGroupHistoryDto } from '../../dto/group/get-group-history.dto';
import { GroupHistoryException } from '../../const/exception/group-history.exception';
import { GroupModel } from '../../../management/groups/entity/group.entity';
import { GroupRoleModel } from '../../../management/groups/entity/group-role.entity';
import { UpdateGroupHistoryDto } from '../../dto/group/update-group-history.dto';

@Injectable()
export class GroupHistoryDomainService implements IGroupHistoryDomainService {
  constructor(
    @InjectRepository(GroupHistoryModel)
    private readonly groupHistoryRepository: Repository<GroupHistoryModel>,
  ) {}

  private getGroupHistoryRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(GroupHistoryModel)
      : this.groupHistoryRepository;
  }

  async paginateGroupHistory(
    member: MemberModel,
    dto: GetGroupHistoryDto,
    qr?: QueryRunner,
  ) {
    const groupHistoryRepository = this.getGroupHistoryRepository(qr);

    const [groupHistories, totalCount] = await Promise.all([
      groupHistoryRepository.find({
        where: {
          memberId: member.id,
        },
        relations: {
          group: true,
          groupRole: true,
        },
        order: {
          endDate: dto.orderDirection,
          startDate: dto.orderDirection,
          id: dto.orderDirection,
        },
        take: dto.take,
        skip: dto.take * (dto.page - 1),
      }),
      groupHistoryRepository.count({
        where: {
          memberId: member.id,
        },
      }),
    ]);

    return { groupHistories, totalCount };
  }

  async findCurrentGroupHistoryModel(
    member: MemberModel,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<GroupHistoryModel>,
  ) {
    const groupHistoryRepository = this.getGroupHistoryRepository(qr);

    const history = await groupHistoryRepository.findOne({
      where: {
        memberId: member.id,
        endDate: IsNull(),
      },
      relations: relationOptions,
    });

    if (!history) {
      throw new NotFoundException(GroupHistoryException.NOT_FOUND);
    }

    return history;
  }

  async findGroupHistoryModelById(
    member: MemberModel,
    groupHistoryId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<GroupHistoryModel>,
  ) {
    const groupHistoryRepository = this.getGroupHistoryRepository(qr);

    const history = await groupHistoryRepository.findOne({
      where: {
        memberId: member.id,
        id: groupHistoryId,
      },
      relations: relationOptions,
    });

    if (!history) {
      throw new NotFoundException(GroupHistoryException.NOT_FOUND);
    }

    return history;
  }

  private async isInGroup(member: MemberModel, qr?: QueryRunner) {
    const groupHistoryRepository = this.getGroupHistoryRepository(qr);

    const isInGroup = await groupHistoryRepository.findOne({
      where: {
        memberId: member.id,
        endDate: IsNull(),
      },
    });

    return !!isInGroup;
  }

  async createGroupHistory(
    member: MemberModel,
    group: GroupModel,
    groupRole: GroupRoleModel | undefined,
    startDate: Date,
    qr: QueryRunner,
  ) {
    const groupHistoryRepository = this.getGroupHistoryRepository(qr);

    const isInGroup = await this.isInGroup(member, qr);

    if (isInGroup) {
      throw new ConflictException(GroupHistoryException.ALREADY_EXIST);
    }

    return groupHistoryRepository.save({
      memberId: member.id,
      group,
      groupRole,
      startDate,
    });
  }

  async endGroupHistory(
    groupHistory: GroupHistoryModel,
    snapShot: {
      groupSnapShot: string;
      groupRoleSnapShot: string | null;
    },
    endDate: Date,
    qr: QueryRunner,
  ) {
    const groupHistoryRepository = this.getGroupHistoryRepository(qr);

    if (groupHistory.startDate > endDate) {
      throw new BadRequestException(GroupHistoryException.INVALID_END_DATE);
    }

    const result = await groupHistoryRepository.update(
      {
        id: groupHistory.id,
      },
      {
        groupId: null,
        groupRoleId: null,
        groupRoleSnapShot: snapShot.groupRoleSnapShot,
        groupSnapShot: snapShot.groupSnapShot,
        endDate: endDate,
      },
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(
        GroupHistoryException.UPDATE_ERROR,
      );
    }

    return result;
  }

  private isValidUpdateDate(
    targetHistory: GroupHistoryModel,
    dto: UpdateGroupHistoryDto,
  ) {
    if (targetHistory.endDate === null && dto.endDate) {
      throw new BadRequestException(
        GroupHistoryException.CANNOT_UPDATE_END_DATE,
      );
    }

    if (dto.startDate && !dto.endDate) {
      if (targetHistory.endDate && dto.startDate > targetHistory.endDate) {
        throw new BadRequestException(
          GroupHistoryException.INVALID_START_DATE,
          //'이력 시작일은 종료일보다 늦을 수 없습니다.',
        );
      }
    }

    if (dto.endDate && !dto.startDate) {
      if (dto.endDate < targetHistory.startDate) {
        throw new BadRequestException(
          GroupHistoryException.INVALID_END_DATE,
          //'이력 종료일은 시작일보다 빠를 수 없습니다.',
        );
      }
    }
  }

  async updateGroupHistory(
    groupHistory: GroupHistoryModel,
    dto: UpdateGroupHistoryDto,
    qr: QueryRunner,
  ) {
    this.isValidUpdateDate(groupHistory, dto);

    const groupHistoryRepository = this.getGroupHistoryRepository(qr);

    const result = await groupHistoryRepository.update(
      {
        id: groupHistory.id,
      },
      {
        startDate: dto.startDate,
        endDate: dto.endDate,
      },
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(
        GroupHistoryException.UPDATE_ERROR,
      );
    }

    return result;
  }

  async deleteGroupHistory(
    groupHistory: GroupHistoryModel,
    qr?: QueryRunner,
  ): Promise<UpdateResult> {
    if (groupHistory.endDate === null) {
      throw new BadRequestException(GroupHistoryException.CANNOT_DELETE);
    }

    const groupHistoryRepository = this.getGroupHistoryRepository(qr);

    const result = await groupHistoryRepository.softDelete(groupHistory.id);

    if (result.affected === 0) {
      throw new InternalServerErrorException(
        GroupHistoryException.DELETE_ERROR,
      );
    }

    return result;
  }
}
