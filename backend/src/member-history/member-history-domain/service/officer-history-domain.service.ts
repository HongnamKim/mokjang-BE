import { InjectRepository } from '@nestjs/typeorm';
import { OfficerHistoryModel } from '../../entity/officer-history.entity';
import { FindOptionsRelations, IsNull, QueryRunner, Repository } from 'typeorm';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ChurchModel } from '../../../churches/entity/church.entity';
import { MemberModel } from '../../../members/entity/member.entity';
import { GetOfficerHistoryDto } from '../../dto/officer/get-officer-history.dto';
import { IOfficerHistoryDomainService } from '../interface/officer-history-domain.service.interface';
import { OfficerModel } from '../../../management/officers/entity/officer.entity';
import { OfficerHistoryException } from '../../exception/officer-history.exception';
import { UpdateOfficerHistoryDto } from '../../dto/officer/update-officer-history.dto';

@Injectable()
export class OfficerHistoryDomainService
  implements IOfficerHistoryDomainService
{
  constructor(
    @InjectRepository(OfficerHistoryModel)
    private readonly officerHistoryRepository: Repository<OfficerHistoryModel>,
  ) {}

  private getOfficerHistoryRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(OfficerHistoryModel)
      : this.officerHistoryRepository;
  }

  async paginateOfficerHistory(
    church: ChurchModel,
    member: MemberModel,
    dto: GetOfficerHistoryDto,
    qr?: QueryRunner,
  ) {
    const officerHistoryRepository = this.getOfficerHistoryRepository(qr);

    const [officerHistories, totalCount] = await Promise.all([
      officerHistoryRepository.find({
        where: {
          member: {
            churchId: church.id,
          },
          memberId: member.id,
        },
        relations: { officer: true },
        order: {
          startDate: dto.orderDirection,
          id: dto.orderDirection,
        },
        take: dto.take,
        skip: dto.take * (dto.page - 1),
      }),
      officerHistoryRepository.count({
        where: {
          member: {
            churchId: church.id,
          },
          memberId: member.id,
        },
      }),
    ]);

    return { officerHistories, totalCount };
  }

  async findCurrentOfficerHistoryModel(
    member: MemberModel,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<OfficerHistoryModel>,
  ) {
    const officerHistoryRepository = this.getOfficerHistoryRepository(qr);

    const history = await officerHistoryRepository.findOne({
      where: {
        memberId: member.id,
        endDate: IsNull(),
      },
      relations: relationOptions,
    });

    if (!history) {
      throw new NotFoundException(OfficerHistoryException.NOT_FOUND);
    }

    if (!history.officer) {
      throw new InternalServerErrorException(
        OfficerHistoryException.RELATION_OPTIONS_ERROR,
        //'현재 직분 이력의 직분 정보를 가져올 수 없음',
      );
    }

    return history;
  }

  async findOfficerHistoryModelById(
    member: MemberModel,
    officerHistoryId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<OfficerHistoryModel>,
  ) {
    const officerHistoryRepository = this.getOfficerHistoryRepository(qr);

    const history = await officerHistoryRepository.findOne({
      where: {
        id: officerHistoryId,
        memberId: member.id,
      },
      relations: relationOptions,
    });

    if (!history) {
      throw new NotFoundException(OfficerHistoryException.NOT_FOUND);
    }

    return history;
  }

  async createOfficerHistory(
    member: MemberModel,
    officer: OfficerModel,
    startDate: Date,
    officerStartChurch: string,
    qr: QueryRunner,
  ) {
    const officerHistoryRepository = this.getOfficerHistoryRepository(qr);

    return officerHistoryRepository.save({
      memberId: member.id,
      officerId: officer.id,
      startDate,
      officerStartChurch,
    });
  }

  async endOfficerHistory(
    officerHistory: OfficerHistoryModel,
    endDate: Date,
    qr: QueryRunner,
  ) {
    if (!officerHistory.officer) {
      throw new InternalServerErrorException(
        OfficerHistoryException.RELATION_OPTIONS_ERROR,
        //'직분 이력의 직분 정보를 가져올 수 없음',
      );
    }

    if (officerHistory.startDate > endDate) {
      throw new BadRequestException(
        OfficerHistoryException.INVALID_END_DATE,
        //'직분 종료일이 시작일을 앞설 수 없습니다.'
      );
    }

    const officerHistoryRepository = this.getOfficerHistoryRepository(qr);

    const officerSnapShot = officerHistory.officer.name;

    const result = await officerHistoryRepository.update(
      { id: officerHistory.id },
      {
        officerId: null,
        officerSnapShot,
        endDate,
      },
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(
        OfficerHistoryException.UPDATE_ERROR,
      );
    }

    return result;
  }

  private isValidUpdateDate(
    officerHistory: OfficerHistoryModel,
    dto: UpdateOfficerHistoryDto,
  ) {
    // 종료되지 않은 이력의 종료 날짜 수정
    if (officerHistory.endDate === null && dto.endDate) {
      throw new BadRequestException(
        OfficerHistoryException.CANNOT_UPDATE_END_DATE,
      );
    }

    // 시작 날짜만 수정
    if (dto.startDate && !dto.endDate) {
      // 종료된 이력의 시작일 수정 시 시작일이 기존 종료일보다 늦을 경우
      if (officerHistory.endDate && dto.startDate > officerHistory.endDate) {
        throw new BadRequestException(
          OfficerHistoryException.INVALID_START_DATE,
          //'이력 시작일은 종료일보다 늦을 수 없습니다.',
        );
      }
    }

    // 종료 날짜만 수정
    if (dto.endDate && !dto.startDate) {
      if (dto.endDate < officerHistory.startDate) {
        throw new BadRequestException(
          OfficerHistoryException.INVALID_END_DATE,
          //'이력 종료일은 시작일보다 빠를 수 없습니다.',
        );
      }
    }
  }

  async updateOfficerHistory(
    officerHistory: OfficerHistoryModel,
    dto: UpdateOfficerHistoryDto,
    qr: QueryRunner,
  ) {
    const officerHistoryRepository = this.getOfficerHistoryRepository(qr);

    this.isValidUpdateDate(officerHistory, dto);

    const result = await officerHistoryRepository.update(
      {
        id: officerHistory.id,
      },
      {
        startDate: dto.startDate,
        endDate: dto.endDate,
      },
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(
        OfficerHistoryException.UPDATE_ERROR,
      );
    }

    return result;
  }

  async deleteOfficerHistory(
    officerHistory: OfficerHistoryModel,
    qr?: QueryRunner,
  ) {
    if (officerHistory.endDate === null) {
      throw new BadRequestException(OfficerHistoryException.CANNOT_DELETE);
    }

    const officerHistoryRepository = this.getOfficerHistoryRepository(qr);

    const result = await officerHistoryRepository.softDelete(officerHistory.id);

    if (result.affected === 0) {
      throw new InternalServerErrorException(
        OfficerHistoryException.DELETE_ERROR,
      );
    }

    return result;
  }
}
