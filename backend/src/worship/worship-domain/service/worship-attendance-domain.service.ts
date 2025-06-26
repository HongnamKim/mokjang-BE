import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { IWorshipAttendanceDomainService } from '../interface/worship-attendance-domain.service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { WorshipAttendanceModel } from '../../entity/worship-attendance.entity';
import {
  Between,
  FindOptionsOrder,
  FindOptionsRelations,
  FindOptionsWhere,
  In,
  QueryRunner,
  Repository,
  UpdateResult,
} from 'typeorm';
import { WorshipSessionModel } from '../../entity/worship-session.entity';
import { GetWorshipAttendancesDto } from '../../dto/request/worship-attendance/get-worship-attendances.dto';
import { WorshipAttendanceDomainPaginationResultDto } from '../dto/worship-attendance-domain-pagination-result.dto';
import { WorshipEnrollmentModel } from '../../entity/worship-enrollment.entity';
import { WorshipAttendanceException } from '../../exception/worship-attendance.exception';
import {
  MemberSummarizedRelation,
  MemberSummarizedSelect,
} from '../../../members/const/member-find-options.const';
import { UpdateWorshipAttendanceDto } from '../../dto/request/worship-attendance/update-worship-attendance.dto';
import { WorshipAttendanceOrderEnum } from '../../const/worship-attendance-order.enum';

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

  private parseOrderOption(
    dto: GetWorshipAttendancesDto,
  ): FindOptionsOrder<WorshipAttendanceModel> {
    if (dto.order === WorshipAttendanceOrderEnum.GROUP_NAME) {
      return {
        worshipEnrollment: {
          member: {
            group: {
              name: dto.orderDirection,
            },
            name: dto.orderDirection,
          },
        },
      };
    } else if (dto.order === WorshipAttendanceOrderEnum.NAME) {
      return {
        worshipEnrollment: {
          member: {
            name: dto.orderDirection,
          },
        },
      };
    } else {
      return {
        [dto.order]: dto.orderDirection,
      };
    }
  }

  async findAttendances(
    session: WorshipSessionModel,
    dto: GetWorshipAttendancesDto,
    groupIds?: number[],
    qr?: QueryRunner,
  ): Promise<WorshipAttendanceDomainPaginationResultDto> {
    const repository = this.getRepository(qr);

    const whereOptions: FindOptionsWhere<WorshipAttendanceModel> = {
      worshipSessionId: session.id,
      worshipEnrollment: {
        member: {
          groupId: groupIds && In(groupIds),
        },
      },
    };

    const orderOptions: FindOptionsOrder<WorshipAttendanceModel> =
      this.parseOrderOption(dto);

    if (dto.order !== WorshipAttendanceOrderEnum.ID) {
      orderOptions.id = 'ASC';
    }

    const [data, totalCount] = await Promise.all([
      repository.find({
        where: whereOptions,
        order: orderOptions,
        take: dto.take,
        skip: dto.take * (dto.page - 1),
        relations: {
          worshipEnrollment: {
            member: MemberSummarizedRelation,
          },
        },
        select: {
          id: true,
          createdAt: true,
          updatedAt: true,
          attendanceStatus: true,
          note: true,
          worshipEnrollment: {
            id: true,
            createdAt: true,
            updatedAt: true,
            presentCount: true,
            absentCount: true,
            member: MemberSummarizedSelect,
          },
        },
      }),
      repository.count({
        where: whereOptions,
      }),
    ]);

    return new WorshipAttendanceDomainPaginationResultDto(data, totalCount);
  }

  async joinAttendance(
    enrollment: WorshipEnrollmentModel,
    fromSessionDate?: Date,
    toSessionDate?: Date,
    qr?: QueryRunner,
  ): Promise<WorshipAttendanceModel[]> {
    const repository = this.getRepository(qr);

    const attendances =
      fromSessionDate && toSessionDate
        ? await repository.find({
            where: {
              worshipEnrollmentId: enrollment.id,
              sessionDate: Between(fromSessionDate, toSessionDate),
            },
            order: {
              sessionDate: 'ASC',
            },
            select: {
              id: true,
              attendanceStatus: true,
              sessionDate: true,
            },
            take: 14,
          })
        : await repository.find({
            where: {
              worshipEnrollmentId: enrollment.id,
            },
            order: {
              sessionDate: 'ASC',
            },
            select: {
              id: true,
              attendanceStatus: true,
              sessionDate: true,
            },
            take: 14,
          });

    for (let i = 0; i < attendances.length / 2; i++) {
      const temp = attendances[i];

      attendances[i] = attendances[attendances.length - 1 - i];
      attendances[attendances.length - 1 - i] = temp;
    }

    return attendances;
  }

  async findAllAttendances(session: WorshipSessionModel, qr: QueryRunner) {
    const repository = this.getRepository(qr);

    return repository.find({
      where: {
        worshipSessionId: session.id,
      },
      relations: {
        worshipEnrollment: true,
      },
    });
  }

  refreshAttendances(
    session: WorshipSessionModel,
    notExistAttendanceEnrollments: WorshipEnrollmentModel[],
    qr: QueryRunner,
  ): Promise<WorshipAttendanceModel[]> {
    const repository = this.getRepository(qr);

    const attendances = repository.create(
      notExistAttendanceEnrollments.map((enrollment) => ({
        sessionDate: session.sessionDate,
        worshipSessionId: session.id,
        worshipEnrollmentId: enrollment.id,
      })),
    );

    return repository.save(attendances, { chunk: 100 });
  }

  async findWorshipAttendanceModelById(
    session: WorshipSessionModel,
    attendanceId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<WorshipAttendanceModel>,
  ): Promise<WorshipAttendanceModel> {
    const repository = this.getRepository(qr);

    const attendance = await repository.findOne({
      where: {
        worshipSessionId: session.id,
        id: attendanceId,
      },
      relations: relationOptions,
    });

    if (!attendance) {
      throw new NotFoundException(WorshipAttendanceException.NOT_FOUND);
    }

    return attendance;
  }

  async findWorshipAttendanceById(
    session: WorshipSessionModel,
    attendanceId: number,
    qr?: QueryRunner,
  ): Promise<WorshipAttendanceModel> {
    const repository = this.getRepository(qr);

    const attendance = await repository.findOne({
      where: {
        worshipSessionId: session.id,
        id: attendanceId,
      },
      relations: {
        worshipEnrollment: {
          member: MemberSummarizedRelation,
        },
      },
      select: {
        worshipEnrollment: {
          id: true,
          member: MemberSummarizedSelect,
        },
      },
    });

    if (!attendance) {
      throw new NotFoundException(WorshipAttendanceException.NOT_FOUND);
    }

    return attendance;
  }

  async updateAttendance(
    targetAttendance: WorshipAttendanceModel,
    dto: UpdateWorshipAttendanceDto,
    qr: QueryRunner,
  ): Promise<UpdateResult> {
    const repository = this.getRepository(qr);

    const result = await repository.update(
      {
        id: targetAttendance.id,
      },
      {
        ...dto,
      },
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(
        WorshipAttendanceException.UPDATE_ERROR,
      );
    }

    return result;
  }

  async deleteAttendanceCascadeSession(
    session: WorshipSessionModel,
    qr: QueryRunner,
  ) {
    const repository = this.getRepository(qr);

    return repository.softDelete({
      worshipSessionId: session.id,
    });
  }

  deleteAttendanceCascadeWorship(
    deletedSessionIds: number[],
    qr: QueryRunner,
  ): Promise<UpdateResult> {
    const repository = this.getRepository(qr);

    return repository.softDelete({
      worshipSessionId: In(deletedSessionIds),
    });
  }
}
