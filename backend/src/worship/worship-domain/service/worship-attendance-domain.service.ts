import { Injectable } from '@nestjs/common';
import { IWorshipAttendanceDomainService } from '../interface/worship-attendance-domain.service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { WorshipAttendanceModel } from '../../entity/worship-attendance.entity';
import { QueryRunner, Repository } from 'typeorm';
import { WorshipSessionModel } from '../../entity/worship-session.entity';
import { GetWorshipAttendancesDto } from '../../dto/request/worship-attendance/get-worship-attendances.dto';
import { WorshipAttendanceDomainPaginationResultDto } from '../dto/worship-attendance-domain-pagination-result.dto';

@Injectable()
export class WorshipAttendanceDomainService
  implements IWorshipAttendanceDomainService
{
  constructor(
    @InjectRepository(WorshipAttendanceModel)
    private readonly repository: Repository<WorshipAttendanceModel>,
  ) {}

  private getRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(WorshipAttendanceModel)
      : this.repository;
  }

  async findAttendances(
    session: WorshipSessionModel,
    dto: GetWorshipAttendancesDto,
    qr?: QueryRunner,
  ): Promise<WorshipAttendanceDomainPaginationResultDto> {
    const repository = this.getRepository(qr);

    const [data, totalCount] = await Promise.all([
      repository.find({
        where: {
          worshipSessionId: session.id,
        },
        take: dto.take,
        skip: dto.take * (dto.page - 1),
        relations: {
          worshipSession: true,
          worshipEnrollment: {
            member: true,
          },
        },
      }),
      repository.count({
        where: {
          worshipSessionId: session.id,
        },
      }),
    ]);

    return new WorshipAttendanceDomainPaginationResultDto(data, totalCount);
  }
}
