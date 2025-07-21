import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { IMinistryHistoryDomainService } from '../interface/ministry-history-domain.service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { MinistryHistoryModel } from '../../entity/ministry-history.entity';
import { FindOptionsRelations, IsNull, QueryRunner, Repository } from 'typeorm';
import { MemberModel } from '../../../../members/entity/member.entity';
import { GetMinistryHistoryDto } from '../../dto/request/get-ministry-history.dto';
import { MinistryHistoryException } from '../../exception/ministry-history.exception';
import { UpdateMinistryHistoryDto } from '../../dto/request/update-ministry-history.dto';
import { StartMinistryHistoryVo } from '../../dto/start-ministry-history.vo';
import { EndMinistryHistoryVo } from '../../dto/end-ministry-history.vo';

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

  async startMinistryHistories(
    ministryHistoryVo: StartMinistryHistoryVo[],
    qr: QueryRunner,
  ): Promise<MinistryHistoryModel[]> {
    const repository = this.getMinistryHistoryRepository(qr);

    const histories = repository.create(
      ministryHistoryVo.map((vo) => ({
        member: {
          id: vo.member.id,
        },
        ministry: {
          id: vo.ministry.id,
        },
        ministryGroupHistory: {
          id: vo.ministryGroupHistory.id,
        },
        startDate: new Date(),
      })),
    );

    return repository.save(histories);
  }

  async endMinistryHistories(
    endMinistryHistoryVo: EndMinistryHistoryVo[],
    qr: QueryRunner,
  ): Promise<MinistryHistoryModel[]> {
    const repository = this.getMinistryHistoryRepository(qr);

    const histories = await repository.find({
      where: endMinistryHistoryVo.map((vo) => ({
        member: { id: vo.member.id },
        ministry: { id: vo.ministry.id },
        endDate: IsNull(),
      })),
    });

    histories.forEach((history, index) => {
      // 종료 시점 사역명 저장
      const assignment = endMinistryHistoryVo.find(
        (a) =>
          a.member.id === history.memberId &&
          a.ministry.id === history.ministryId,
      );
      if (assignment) {
        history.ministrySnapShot = assignment.ministry.name;
      }

      // 종료 시점
      history.endDate = new Date();

      // 이력 - 사역 관계 해제
      history.ministryId = null;
      history.ministry = null;
    });

    return repository.save(histories);
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
