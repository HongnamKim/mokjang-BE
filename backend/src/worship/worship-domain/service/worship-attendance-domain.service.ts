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
import { WorshipModel } from '../../entity/worship.entity';
import { AttendanceStatus } from '../../const/attendance-status.enum';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';
import { TIME_ZONE } from '../../../common/const/time-zone.const';
import { getDay, startOfDay, subDays, subWeeks } from 'date-fns';

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
    enrollmentIds: number[],
    fromSessionDate?: Date,
    toSessionDate?: Date,
    qr?: QueryRunner,
  ): Promise<WorshipAttendanceModel[]> {
    const repository = this.getRepository(qr);

    const attendances =
      fromSessionDate && toSessionDate
        ? await repository.find({
            where: {
              worshipEnrollmentId: In(enrollmentIds),
              sessionDate: Between(fromSessionDate, toSessionDate),
            },
            order: {
              sessionDate: 'DESC',
            },
            select: {
              id: true,
              worshipEnrollmentId: true,
              attendanceStatus: true,
              sessionDate: true,
            },
            take: 14 * enrollmentIds.length,
          })
        : await repository.find({
            where: {
              worshipEnrollmentId: In(enrollmentIds),
            },
            order: {
              sessionDate: 'DESC',
            },
            select: {
              id: true,
              worshipEnrollmentId: true,
              attendanceStatus: true,
              sessionDate: true,
            },
            take: 14 * enrollmentIds.length,
          });

    attendances.reverse();

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

  async deleteAttendanceCascadeWorship(
    deletedSessionIds: number[],
    qr: QueryRunner,
  ): Promise<UpdateResult> {
    const repository = this.getRepository(qr);

    return repository.softDelete({
      worshipSessionId: In(deletedSessionIds),
    });
  }

  async getAttendanceStatsByWorship(
    worship: WorshipModel,
    requestGroupIds: number[] | undefined,
  ): Promise<number> {
    const repository = this.getRepository();

    const query = repository
      .createQueryBuilder('attendance')
      .innerJoin(
        'attendance.worshipSession',
        'session',
        'session.worshipId = :worshipId',
      )
      .where('session.worshipId = :worshipId', { worshipId: worship.id })
      .select([
        'SUM(CASE WHEN attendance.attendanceStatus = :present THEN 1 ELSE 0 END) as presentCount',
        'SUM(CASE WHEN attendance.attendanceStatus = :absent THEN 1 ELSE 0 END) as absentCount',
        'SUM(CASE WHEN attendance.attendanceStatus = :unknown THEN 1 ELSE 0 END) as unknownCount',
      ])
      .setParameters({
        present: AttendanceStatus.PRESENT,
        absent: AttendanceStatus.ABSENT,
        unknown: AttendanceStatus.UNKNOWN,
      });

    if (requestGroupIds) {
      query
        .leftJoin('attendance.worshipEnrollment', 'enrollment')
        .leftJoin('enrollment.member', 'member')
        .andWhere('member.groupId IN (:...groupIds)', {
          groupIds: requestGroupIds,
        });
    }

    const result = await query.getRawOne();

    const presentCount = parseInt(result.presentcount) || 0;
    const absentCount = parseInt(result.absentcount) || 0;

    const totalChecked = presentCount + absentCount;

    return totalChecked > 0 ? (presentCount / totalChecked) * 100 : 0;
  }

  async getMovingAverageAttendance(
    worship: WorshipModel,
    requestGroupIds: number[] | undefined,
  ): Promise<{
    last4Weeks: number;
    last12Weeks: number;
  }> {
    const repository = this.getRepository();

    const nowKst = toZonedTime(new Date(), TIME_ZONE.SEOUL);
    const currentDayOfWeek = getDay(nowKst);

    const worshipDay = worship.worshipDay;
    let daysToLastWorship = currentDayOfWeek - worshipDay;

    // 이미 지난 예배
    if (daysToLastWorship < 0) {
      daysToLastWorship += 7;
    } else if (daysToLastWorship === 0) {
      // 예배 당일
      daysToLastWorship = 0;
    }

    // 최근 예배일 (한국 시간 기준)
    const lastWorshipDateKst = subDays(startOfDay(nowKst), daysToLastWorship);

    const fourWeeksAgoKst = subWeeks(lastWorshipDateKst, 4);
    const twelveWeeksAgoKst = subWeeks(lastWorshipDateKst, 12);

    //const now = new Date();
    const fourWeeksAgo = fromZonedTime(fourWeeksAgoKst, TIME_ZONE.SEOUL); //new Date(now.getTime() - 4 * 7 * 24 * 60 * 60 * 1000);
    const twelveWeeksAgo = fromZonedTime(twelveWeeksAgoKst, TIME_ZONE.SEOUL); //new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000);

    const statsQuery = (weeksAgo: Date) => {
      const query = repository
        .createQueryBuilder('attendance')
        .innerJoin('attendance.worshipSession', 'session')
        .where('session.worshipId = :worshipId', { worshipId: worship.id })
        .andWhere('session.sessionDate >= :weeksAgo', { weeksAgo })
        .select([
          'SUM(CASE WHEN attendance.attendanceStatus = :present THEN 1 ELSE 0 END) as presentCount',
          'SUM(CASE WHEN attendance.attendanceStatus = :absent THEN 1 ELSE 0 END) as absentCount',
        ])
        .setParameters({
          present: AttendanceStatus.PRESENT,
          absent: AttendanceStatus.ABSENT,
        });

      if (requestGroupIds) {
        query
          .leftJoin('attendance.worshipEnrollment', 'enrollment')
          .leftJoin('enrollment.member', 'member')
          .andWhere('member.groupId IN (:...groupId)', {
            groupId: requestGroupIds,
          });
      }

      return query;
    };

    const last4WeeksStatsQuery = statsQuery(fourWeeksAgo);
    const last12WeeksStatsQuery = statsQuery(twelveWeeksAgo);

    const [last4WeeksStats, last12WeeksStats] = await Promise.all([
      last4WeeksStatsQuery.getRawOne(),
      last12WeeksStatsQuery.getRawOne(),
    ]);

    const calc = (stats: any) => {
      const present = parseInt(stats.presentcount) || 0;
      const absent = parseInt(stats.absentcount) || 0;
      const total = present + absent;

      return total > 0 ? (present / total) * 100 : 0;
    };

    return {
      last4Weeks: calc(last4WeeksStats),
      last12Weeks: calc(last12WeeksStats),
    };
  }
}
