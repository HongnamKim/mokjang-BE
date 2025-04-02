import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { IMinistryHistoryDomainService } from './interface/ministry-history-domain.service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { MinistryHistoryModel } from '../../entity/ministry-history.entity';
import { FindOptionsRelations, IsNull, QueryRunner, Repository } from 'typeorm';
import { MemberModel } from '../../../members/entity/member.entity';
import { GetMinistryHistoryDto } from '../../dto/ministry/get-ministry-history.dto';
import { MinistryModel } from '../../../management/ministries/entity/ministry.entity';
import { MinistryHistoryException } from '../../const/exception/ministry-history.exception';
import { UpdateMinistryHistoryDto } from '../../dto/ministry/update-ministry-history.dto';

@Injectable()
export class MinistryHistoryDomainService
  implements IMinistryHistoryDomainService
{
  constructor(
    @InjectRepository(MinistryHistoryModel)
    private ministryHistoryRepository: Repository<MinistryHistoryModel>,
  ) {}

  private getMinistryHistoryRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(MinistryHistoryModel)
      : this.ministryHistoryRepository;
  }

  async paginateMinistryHistory(
    member: MemberModel,
    dto: GetMinistryHistoryDto,
    qr?: QueryRunner,
  ) {
    const ministryHistoryRepository = this.getMinistryHistoryRepository(qr);

    const [ministryHistories, totalCount] = await Promise.all([
      ministryHistoryRepository.find({
        where: {
          memberId: member.id,
        },
        relations: {
          ministry: {
            ministryGroup: true,
          },
        },
        order: {
          endDate: dto.orderDirection,
          startDate: dto.orderDirection,
          id: dto.orderDirection,
        },
        take: dto.take,
        skip: dto.take * (dto.page - 1),
      }),
      ministryHistoryRepository.count({
        where: {
          memberId: member.id,
        },
      }),
    ]);

    return { ministryHistories, totalCount };
  }

  async findMinistryHistoryModelById(
    member: MemberModel,
    ministryHistoryId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<MinistryHistoryModel>,
  ) {
    const ministryHistoryRepository = this.getMinistryHistoryRepository(qr);

    const ministryHistory = await ministryHistoryRepository.findOne({
      where: {
        id: ministryHistoryId,
        memberId: member.id,
      },
      relations: relationOptions,
    });

    if (!ministryHistory) {
      throw new NotFoundException(MinistryHistoryException.NOT_FOUND);
    }

    return ministryHistory;
  }

  private async isExistMinistryHistory(
    member: MemberModel,
    ministry: MinistryModel,
    qr?: QueryRunner,
  ) {
    const ministryHistoryRepository = this.getMinistryHistoryRepository(qr);

    const ministryHistory = await ministryHistoryRepository.findOne({
      where: {
        memberId: member.id,
        ministryId: ministry.id,
        endDate: IsNull(),
      },
    });

    return !!ministryHistory;
  }

  async createMinistryHistory(
    member: MemberModel,
    ministry: MinistryModel,
    startDate: Date,
    qr: QueryRunner,
  ) {
    const ministryHistoryRepository = this.getMinistryHistoryRepository(qr);

    const isExistMinistryHistory = await this.isExistMinistryHistory(
      member,
      ministry,
      qr,
    );

    if (isExistMinistryHistory) {
      throw new ConflictException(MinistryHistoryException.ALREADY_EXIST);
    }

    return ministryHistoryRepository.save({
      //memberId: member.id,
      //ministryId: ministry.id,
      member,
      ministry,
      startDate,
    });
  }

  async endMinistryHistory(
    ministryHistory: MinistryHistoryModel,
    snapShot: {
      ministrySnapShot: string;
      ministryGroupSnapShot: string | null;
    },
    endDate: Date,
    qr: QueryRunner,
  ) {
    const ministryHistoryRepository = this.getMinistryHistoryRepository(qr);

    const result = await ministryHistoryRepository.update(
      { id: ministryHistory.id },
      {
        ministryId: null,
        ministrySnapShot: snapShot.ministrySnapShot,
        ministryGroupSnapShot: snapShot.ministryGroupSnapShot,
        endDate,
      },
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(
        MinistryHistoryException.UPDATE_ERROR,
      );
    }

    return result;
  }

  private isValidUpdateDate(
    targetHistory: MinistryHistoryModel,
    dto: UpdateMinistryHistoryDto,
  ) {
    if (targetHistory.endDate === null && dto.endDate) {
      throw new BadRequestException(
        MinistryHistoryException.CANNOT_UPDATE_END_DATE,
        //'종료되지 않은 사역의 종료 날짜를 수정할 수 없습니다.',
      );
    }

    // 시작일 변경하는 경우 --> 새로운 시작일이 종료일보다 앞에 있어야함
    // 종료일 변경하는 경우 --> 새로운 종료일이 시작일보다 뒤에 있어야함
    // 시작일,종료일 변경하는 경우 --> DTO 에서 검증

    if (dto.startDate && !dto.endDate) {
      if (targetHistory.endDate && dto.startDate > targetHistory.endDate) {
        throw new BadRequestException(
          MinistryHistoryException.INVALID_START_DATE,
          //'이력 시작일은 종료일보다 늦을 수 없습니다.',
        );
      }
    }

    if (dto.endDate && !dto.startDate) {
      if (dto.endDate < targetHistory.startDate) {
        throw new BadRequestException(
          MinistryHistoryException.INVALID_END_DATE,
          //'이력 종료일은 시작일보다 빠를 수 없습니다.',
        );
      }
    }
  }

  async updateMinistryHistory(
    ministryHistory: MinistryHistoryModel,
    dto: UpdateMinistryHistoryDto,
    qr?: QueryRunner,
  ) {
    const ministryHistoryRepository = this.getMinistryHistoryRepository(qr);

    this.isValidUpdateDate(ministryHistory, dto);

    const result = await ministryHistoryRepository.update(
      {
        id: ministryHistory.id,
      },
      {
        startDate: dto.startDate,
        endDate: dto.endDate,
      },
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(
        MinistryHistoryException.UPDATE_ERROR,
      );
    }

    return result;
  }

  async deleteMinistryHistory(
    ministryHistory: MinistryHistoryModel,
    qr?: QueryRunner,
  ) {
    if (ministryHistory.endDate === null) {
      throw new BadRequestException(MinistryHistoryException.CANNOT_DELETE);
    }

    const ministryHistoryRepository = this.getMinistryHistoryRepository(qr);

    const result = await ministryHistoryRepository.softDelete(
      ministryHistory.id,
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(
        MinistryHistoryException.DELETE_ERROR,
      );
    }

    return result;
  }
}
