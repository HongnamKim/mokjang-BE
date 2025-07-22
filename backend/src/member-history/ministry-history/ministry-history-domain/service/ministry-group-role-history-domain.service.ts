import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { IMinistryGroupRoleHistoryDomainService } from '../interface/ministry-group-role-history-domain.service.interface';
import { MinistryGroupHistoryModel } from '../../entity/ministry-group-history.entity';
import { MinistryGroupRoleHistoryModel } from '../../entity/ministry-group-role-history.entity';
import {
  FindOptionsRelations,
  IsNull,
  QueryRunner,
  Repository,
  UpdateResult,
} from 'typeorm';
import { GetMinistryGroupRoleHistoriesDto } from '../../dto/request/role/get-ministry-group-role-histories.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MinistryGroupRoleHistoryException } from '../../exception/ministry-group-role-history.exception';
import { GroupRole } from '../../../../management/groups/const/group-role.enum';
import {
  getHistoryEndDate,
  getHistoryStartDate,
  HistoryUpdateDate,
} from '../../../history-date.utils';
import { TIME_ZONE } from '../../../../common/const/time-zone.const';

@Injectable()
export class MinistryGroupRoleHistoryDomainService
  implements IMinistryGroupRoleHistoryDomainService
{
  constructor(
    @InjectRepository(MinistryGroupRoleHistoryModel)
    private readonly repository: Repository<MinistryGroupRoleHistoryModel>,
  ) {}

  private getRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(MinistryGroupRoleHistoryModel)
      : this.repository;
  }

  paginateMinistryGroupRoleHistory(
    ministryGroupRoleHistory: MinistryGroupHistoryModel,
    dto: GetMinistryGroupRoleHistoriesDto,
    qr?: QueryRunner,
  ): Promise<MinistryGroupRoleHistoryModel[]> {
    const repository = this.getRepository(qr);

    return repository.find({
      where: {
        ministryGroupHistoryId: ministryGroupRoleHistory.id,
      },
      order: { endDate: dto.orderDirection, startDate: dto.orderDirection },
      take: dto.take,
      skip: dto.take * (dto.page - 1),
    });
  }

  async findMinistryGroupRoleHistoryModelById(
    ministryGroupHistory: MinistryGroupHistoryModel,
    ministryGroupRoleHistoryId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<MinistryGroupRoleHistoryModel>,
  ): Promise<MinistryGroupRoleHistoryModel> {
    const repository = this.getRepository(qr);

    const history = await repository.findOne({
      where: {
        ministryGroupHistoryId: ministryGroupHistory.id,
        id: ministryGroupRoleHistoryId,
      },
      relations: relationOptions,
    });

    if (!history) {
      throw new NotFoundException(MinistryGroupRoleHistoryException.NOT_FOUND);
    }

    return history;
  }

  startMinistryGroupRoleHistory(
    ministryGroupHistory: MinistryGroupHistoryModel,
    qr?: QueryRunner,
  ): Promise<MinistryGroupRoleHistoryModel> {
    const repository = this.getRepository(qr);

    return repository.save({
      ministryGroupHistoryId: ministryGroupHistory.id,
      role: GroupRole.LEADER,
      startDate: getHistoryStartDate(TIME_ZONE.SEOUL),
    });
  }

  async endMinistryGroupRoleHistory(
    ministryGroupHistory: MinistryGroupHistoryModel,
    qr?: QueryRunner,
  ): Promise<MinistryGroupRoleHistoryModel> {
    const repository = this.getRepository(qr);

    const endTarget = await repository.findOne({
      where: {
        ministryGroupHistoryId: ministryGroupHistory.id,
        endDate: IsNull(),
      },
    });

    if (!endTarget) {
      throw new NotFoundException(MinistryGroupRoleHistoryException.NOT_FOUND);
    }

    endTarget.endDate = getHistoryEndDate(TIME_ZONE.SEOUL);

    return repository.save(endTarget);
  }

  async updateMinistryGroupRoleHistory(
    targetHistory: MinistryGroupRoleHistoryModel,
    historyDate: HistoryUpdateDate,
    qr?: QueryRunner,
  ): Promise<UpdateResult> {
    const repository = this.getRepository(qr);

    if (!targetHistory.endDate && historyDate.endDate) {
      throw new BadRequestException(
        MinistryGroupRoleHistoryException.CANNOT_UPDATE_END_DATE,
      );
    }

    // 시작 날짜만 변경
    if (historyDate.startDate && !historyDate.endDate) {
      if (
        targetHistory.endDate &&
        historyDate.startDate > targetHistory.endDate
      ) {
        throw new BadRequestException(
          MinistryGroupRoleHistoryException.INVALID_START_DATE,
        );
      }
    }
    // 종료 날짜만 변경
    else if (!historyDate.startDate && historyDate.endDate) {
      if (historyDate.endDate < targetHistory.startDate) {
        throw new BadRequestException(
          MinistryGroupRoleHistoryException.INVALID_END_DATE,
        );
      }
    }

    const result = await repository.update(
      {
        id: targetHistory.id,
      },
      {
        startDate: historyDate.startDate,
        endDate: historyDate.endDate,
      },
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(
        MinistryGroupRoleHistoryException.UPDATE_ERROR,
      );
    }

    return result;
  }

  async deleteMinistryGroupRoleHistory(
    targetHistory: MinistryGroupRoleHistoryModel,
    qr?: QueryRunner,
  ): Promise<UpdateResult> {
    if (!targetHistory.endDate) {
      throw new BadRequestException(
        MinistryGroupRoleHistoryException.CANNOT_DELETE,
      );
    }

    const repository = this.getRepository(qr);

    const result = await repository.softDelete({
      id: targetHistory.id,
    });

    if (result.affected === 0) {
      throw new InternalServerErrorException(
        MinistryGroupRoleHistoryException.DELETE_ERROR,
      );
    }

    return result;
  }
}
