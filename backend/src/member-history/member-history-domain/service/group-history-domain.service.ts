import { IGroupHistoryDomainService } from '../interface/group-history-domain.service.interface';
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
import { GroupHistoryException } from '../../exception/group-history.exception';
import { GroupModel } from '../../../management/groups/entity/group.entity';
import { GroupRole } from '../../../management/groups/const/group-role.enum';

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
    //groupRole: GroupRole,
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
      groupRole: GroupRole.MEMBER,
      startDate,
    });
  }

  async endGroupHistory(
    groupHistory: GroupHistoryModel,
    groupSnapShot: string,
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
        groupSnapShot: groupSnapShot,
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
    startDate: Date | undefined,
    endDate: Date | undefined,
  ) {
    if (targetHistory.endDate === null && endDate) {
      throw new BadRequestException(
        GroupHistoryException.CANNOT_UPDATE_END_DATE,
      );
    }

    if (startDate && !endDate) {
      if (targetHistory.endDate && startDate > targetHistory.endDate) {
        throw new BadRequestException(GroupHistoryException.INVALID_START_DATE);
      }
    }

    if (endDate && !startDate) {
      if (endDate < targetHistory.startDate) {
        throw new BadRequestException(GroupHistoryException.INVALID_END_DATE);
      }
    }
  }

  async updateGroupHistory(
    groupHistory: GroupHistoryModel,
    startDate: Date | undefined,
    endDate: Date | undefined,
    qr: QueryRunner,
  ) {
    this.isValidUpdateDate(groupHistory, startDate, endDate);

    const groupHistoryRepository = this.getGroupHistoryRepository(qr);

    const result = await groupHistoryRepository.update(
      {
        id: groupHistory.id,
      },
      {
        startDate: startDate,
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
