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
  SelectQueryBuilder,
  UpdateResult,
} from 'typeorm';
import { WorshipSessionModel } from '../../entity/worship-session.entity';
import { GetWorshipAttendancesDto } from '../../dto/request/worship-attendance/get-worship-attendances.dto';
import { WorshipAttendanceDomainPaginationResultDto } from '../dto/worship-attendance-domain-pagination-result.dto';
import { WorshipEnrollmentModel } from '../../entity/worship-enrollment.entity';
import { WorshipAttendanceException } from '../../exception/worship-attendance.exception';
import {
  MemberSimpleSelectQB,
  MemberSummarizedGroupSelectQB,
  MemberSummarizedOfficerSelectQB,
  MemberSummarizedRelation,
  MemberSummarizedSelect,
} from '../../../members/const/member-find-options.const';
import { UpdateWorshipAttendanceDto } from '../../dto/request/worship-attendance/update-worship-attendance.dto';
import { WorshipAttendanceOrder } from '../../const/worship-attendance-order.enum';
import { WorshipModel } from '../../entity/worship.entity';
import { AttendanceStatus } from '../../const/attendance-status.enum';
import { GetWorshipAttendanceListDto } from '../../dto/request/worship-attendance/get-worship-attendance-list.dto';
import { WorshipAttendanceSortColumn } from '../../const/worship-attendance-sort-column.enum';
import { DomainCursorPaginationResultDto } from '../../../common/dto/domain-cursor-pagination-result.dto';
import { MemberModel } from '../../../members/entity/member.entity';
import { GetMemberWorshipAttendancesDto } from '../../../members/dto/request/worship/get-member-worship-attendances.dto';
import { session } from 'passport';

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
    if (dto.order === WorshipAttendanceOrder.GROUP_NAME) {
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
    } else if (dto.order === WorshipAttendanceOrder.NAME) {
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

  async findAttendanceList(
    session: WorshipSessionModel,
    dto: GetWorshipAttendanceListDto,
    groupIds: number[] | undefined,
    qr?: QueryRunner,
  ) {
    const repository = this.getRepository(qr);

    const query = repository
      .createQueryBuilder('attendance')
      .where('attendance.worshipSessionId = :sessionId', {
        sessionId: session.id,
      })
      .select([
        'attendance.id',
        'attendance.attendanceStatus',
        'attendance.note',
      ])
      .leftJoin('attendance.worshipEnrollment', 'enrollment')
      .addSelect(['enrollment.id'])
      .leftJoin('enrollment.member', 'member')
      .addSelect(MemberSimpleSelectQB)
      .leftJoin('member.group', 'group')
      .addSelect(MemberSummarizedGroupSelectQB)
      .leftJoin('member.officer', 'officer')
      .addSelect(MemberSummarizedOfficerSelectQB);

    if (groupIds) {
      query.andWhere('member.groupId IN (:...groupIds)', { groupIds });
    }

    this.applySorting(query, dto.sortBy, dto.sortDirection);

    if (dto.cursor) {
      this.applyCursorPagination(
        query,
        dto.cursor,
        dto.sortBy,
        dto.sortDirection,
      );
    }

    const items = await query.limit(dto.limit + 1).getMany();

    const hasMore = items.length > dto.limit;
    if (hasMore) {
      items.pop();
    }

    const nextCursor =
      hasMore && items.length > 0
        ? this.encodeCursor(items[items.length - 1], dto.sortBy)
        : undefined;

    return new DomainCursorPaginationResultDto(items, nextCursor, hasMore);
  }

  private applySorting(
    query: SelectQueryBuilder<WorshipAttendanceModel>,
    sortBy: WorshipAttendanceSortColumn,
    sortDirection: 'ASC' | 'DESC',
  ) {
    switch (sortBy) {
      case WorshipAttendanceSortColumn.ATTENDANCE_STATUS:
        query.orderBy('attendance.attendanceStatus', sortDirection);
        break;
      case WorshipAttendanceSortColumn.GROUP_NAME:
        query.orderBy('group.name', sortDirection);
        break;
      case WorshipAttendanceSortColumn.NAME:
        query.orderBy('member.name', sortDirection);
        break;
    }

    query.addOrderBy('attendance.id', sortDirection);
  }

  private applyCursorPagination(
    query: SelectQueryBuilder<WorshipAttendanceModel>,
    cursor: string,
    sortBy: WorshipAttendanceSortColumn,
    sortDirection: 'ASC' | 'DESC',
  ) {
    const decodedCursor = this.decodeCursor(cursor);

    if (!decodedCursor) return;

    if (decodedCursor.column !== sortBy) return;

    const { id, value } = decodedCursor;

    const column = this.getSortColumnPath(sortBy);

    if (value === null) {
      if (sortDirection === 'ASC') {
        query.andWhere(
          `(${column} IS NOT NULL OR (${column} IS NULL AND attendance.id > :id))`,
          { id },
        );
      } else {
        query.andWhere('attendance.id < :id', { id });
      }
    } else {
      if (sortDirection === 'ASC') {
        query.andWhere(
          `(${column} > :value OR (${column} = :value AND attendance.id > :id) OR (${column} IS NULL))`,
          { value, id },
        );
      } else {
        query.andWhere(
          `(${column} < :value OR (${column} = :value AND attendance.id < :id))`,
          { value, id },
        );
      }
    }
  }

  private getSortColumnPath(sortBy: WorshipAttendanceSortColumn) {
    switch (sortBy) {
      case WorshipAttendanceSortColumn.SESSION_DATE:
        return 'attendance.sessionDate';
      case WorshipAttendanceSortColumn.ATTENDANCE_STATUS:
        return 'attendance.attendanceStatus';
      case WorshipAttendanceSortColumn.GROUP_NAME:
        return 'group.name';
      case WorshipAttendanceSortColumn.NAME:
        return 'member.name';
    }
  }

  private encodeCursor(
    attendance: WorshipAttendanceModel,
    sortBy: WorshipAttendanceSortColumn,
  ) {
    let value: any;

    switch (sortBy) {
      case WorshipAttendanceSortColumn.NAME:
        value = attendance.worshipEnrollment.member.name;
        break;
      case WorshipAttendanceSortColumn.GROUP_NAME:
        value = attendance.worshipEnrollment.member.group?.name || null;
        break;
      case WorshipAttendanceSortColumn.SESSION_DATE:
        value = attendance.sessionDate;
        break;
      default:
        value = attendance.attendanceStatus;
        break;
    }

    const cursorData = {
      id: attendance.id,
      value,
      column: sortBy,
    };

    return Buffer.from(JSON.stringify(cursorData)).toString('base64');
  }

  private decodeCursor(cursor: string) {
    try {
      const decoded = Buffer.from(cursor, 'base64').toString('utf-8');
      return JSON.parse(decoded);
    } catch {
      return null;
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

    if (dto.order !== WorshipAttendanceOrder.ID) {
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

  async getAttendanceStatsBySession(
    worshipSession: WorshipSessionModel,
    requestGroupIds: number[] | undefined,
    qr?: QueryRunner,
  ) {
    const repository = this.getRepository(qr);

    const query = repository
      .createQueryBuilder('attendance')
      .innerJoin(
        'attendance.worshipSession',
        'session',
        'session.id = :sessionId',
        { sessionId: worshipSession.id },
      )
      .select([
        'SUM(CASE WHEN attendance.attendanceStatus = :present THEN 1 ELSE 0 END) as present_count',
        'SUM(CASE WHEN attendance.attendanceStatus = :absent THEN 1 ELSE 0 END) as absent_count',
        'SUM(CASE WHEN attendance.attendanceStatus = :unknown THEN 1 ELSE 0 END) as unknown_count',
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

    return {
      presentCount: parseInt(result.present_count) || 0,
      absentCount: parseInt(result.absent_count) || 0,
      unknownCount: parseInt(result.unknown_count) || 0,
    };
  }

  async getOverallAttendanceStats(
    worship: WorshipModel,
    requestGroupIds: number[] | undefined,
  ): Promise<{ overallRate: number; attendanceCheckRate: number }> {
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
    const unknownCount = parseInt(result.unknowncount) || 0;

    const totalCount = presentCount + absentCount + unknownCount;
    const totalChecked = presentCount + absentCount;

    return {
      overallRate: totalChecked > 0 ? (presentCount / totalChecked) * 100 : 0,
      attendanceCheckRate:
        totalCount > 0 ? (totalChecked / totalCount) * 100 : 0,
    };
  }

  async getAttendanceStatsByPeriod(
    worship: WorshipModel,
    requestGroupIds: number[] | undefined,
    from: Date,
    to: Date | undefined,
  ): Promise<{ rate: number; attendanceCheckRate: number }> {
    const repository = this.getRepository();

    // const lastWorshipDate = getRecentSessionDate(worship, TIME_ZONE.SEOUL);
    // const fourWeeksAgo = subWeeks(lastWorshipDate, 4);
    // const twelveWeeksAgo = subWeeks(lastWorshipDate, 12);

    const statsQuery = (from: Date, to?: Date) => {
      const query = repository
        .createQueryBuilder('attendance')
        .innerJoin('attendance.worshipSession', 'session')
        .where('session.worshipId = :worshipId', { worshipId: worship.id })
        .andWhere('session.sessionDate >= :from', { from })
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

      if (to) {
        query.andWhere('session.sessionDate <= :to', { to });
      }

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

    const customStatsQuery = statsQuery(from, to);

    const customStats = await customStatsQuery.getRawOne();

    const result = {
      presentCount: +customStats.presentcount,
      absentCount: +customStats.absentcount,
      unknownCount: +customStats.unknowncount,
    };

    const totalCheck = result.presentCount + result.absentCount;
    const totalCount = totalCheck + result.unknownCount;

    return {
      rate: totalCheck > 0 ? (result.presentCount / totalCheck) * 100 : 0,
      attendanceCheckRate: totalCount > 0 ? (totalCheck / totalCount) * 100 : 0,
    };
  }

  async getStatisticsByMemberAndPeriod(
    member: MemberModel,
    worship: WorshipModel,
    from: Date,
    to: Date,
  ) {
    const repository = this.getRepository();

    const query = repository
      .createQueryBuilder('attendance')
      .innerJoin('attendance.worshipSession', 'session')
      .innerJoin(
        'attendance.worshipEnrollment',
        'enrollment',
        'enrollment.memberId = :memberId AND enrollment.worshipId = :worshipId',
        { memberId: member.id, worshipId: worship.id },
      )
      .where('attendance.sessionDate BETWEEN :from AND :to', { from, to })
      .select([
        'COUNT(CASE WHEN attendance.attendanceStatus = :present THEN 1 END) as presentCount',
        'COUNT(CASE WHEN attendance.attendanceStatus = :absent THEN 1 END) as absentCount',
        'COUNT(CASE WHEN attendance.attendanceStatus = :unknown THEN 1 END) as unknownCount',
        'COUNT(DISTINCT session.id) as totalSessions',
      ])
      .setParameters({
        present: AttendanceStatus.PRESENT,
        absent: AttendanceStatus.ABSENT,
        unknown: AttendanceStatus.UNKNOWN,
      });

    const result = await query.getRawOne();

    return {
      presentCount: +result.presentcount || 0,
      absentCount: +result.absentcount || 0,
      unknownCount: +result.unknowncount || 0,
      totalSessions: +result.totalsessions || 0,
    };
  }

  async findMemberWorshipAttendances(
    member: MemberModel,
    worship: WorshipModel,
    dto: GetMemberWorshipAttendancesDto,
  ) {
    const repository = this.getRepository();

    const query = repository
      .createQueryBuilder('attendance')
      .select([
        'attendance.id',
        'attendance.attendanceStatus',
        'attendance.note',
        'attendance.sessionDate',
      ])
      .innerJoin(
        'attendance.worshipEnrollment',
        'enrollment',
        'enrollment.memberId = :memberId AND enrollment.worshipId = :worshipId',
        { memberId: member.id, worshipId: worship.id },
      )
      .where('attendance.sessionDate BETWEEN :from AND :to', {
        from: dto.utcFrom,
        to: dto.utcTo,
      })
      .leftJoin('attendance.worshipSession', 'session')
      .addSelect(['session.id', 'session.title'])
      .orderBy('attendance.sessionDate', dto.sortDirection)
      .addOrderBy('attendance.id', dto.sortDirection);

    if (dto.cursor) {
      this.applyCursorPagination(
        query,
        dto.cursor,
        WorshipAttendanceSortColumn.SESSION_DATE,
        dto.sortDirection,
      );
    }

    const items = await query.limit(dto.limit + 1).getMany();

    const hasMore = items.length > dto.limit;
    if (hasMore) {
      items.pop();
    }

    const nextCursor =
      items.length > 0 && hasMore
        ? this.encodeCursor(
            items[items.length - 1],
            WorshipAttendanceSortColumn.SESSION_DATE,
          )
        : undefined;

    return {
      items,
      nextCursor,
      hasMore,
    };
  }

  findAbsentAttendances(
    session: WorshipSessionModel,
    groupIds: number[] | undefined,
    qr: QueryRunner,
  ): Promise<WorshipAttendanceModel[]> {
    const repository = this.getRepository(qr);

    return repository.find({
      where: {
        worshipSessionId: session.id,
        attendanceStatus: AttendanceStatus.ABSENT,
        worshipEnrollment: groupIds && {
          member: {
            groupId: In(groupIds),
          },
        },
      },
    });
  }

  findUnknownAttendances(
    session: WorshipSessionModel,
    groupIds: number[] | undefined,
    qr: QueryRunner,
  ): Promise<WorshipAttendanceModel[]> {
    const repository = this.getRepository(qr);

    return repository.find({
      where: {
        worshipSessionId: session.id,
        attendanceStatus: AttendanceStatus.UNKNOWN,
        worshipEnrollment: groupIds && {
          member: {
            groupId: In(groupIds),
          },
        },
      },
    });
  }

  async updateAllAttended(
    updateTargetIds: number[],
    qr: QueryRunner,
  ): Promise<UpdateResult> {
    const repository = this.getRepository(qr);

    const result = await repository.update(
      { id: In(updateTargetIds) },
      { attendanceStatus: AttendanceStatus.PRESENT },
    );

    if (result.affected !== updateTargetIds.length) {
      throw new InternalServerErrorException(
        WorshipAttendanceException.UPDATE_ERROR,
      );
    }

    return result;
  }
}
