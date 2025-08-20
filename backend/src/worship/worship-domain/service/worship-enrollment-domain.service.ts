import { Injectable } from '@nestjs/common';
import { IWorshipEnrollmentDomainService } from '../interface/worship-enrollment-domain.service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { WorshipEnrollmentModel } from '../../entity/worship-enrollment.entity';
import { QueryRunner, Repository, SelectQueryBuilder } from 'typeorm';
import { WorshipModel } from '../../entity/worship.entity';
import { MemberModel } from '../../../members/entity/member.entity';
import { GetWorshipEnrollmentsDto } from '../../dto/request/worship-enrollment/get-worship-enrollments.dto';
import { WorshipEnrollmentDomainPaginationResultDto } from '../dto/worship-enrollment-domain-pagination-result.dto';
import { WorshipEnrollmentOrderEnum } from '../../const/worship-enrollment-order.enum';
import { GetLowWorshipAttendanceMembersDto } from '../../../home/dto/request/get-low-worship-attendance-members.dto';
import { LowAttendanceOrder } from '../../../home/const/low-attendance-order.enum';
import { SimpleMemberDto } from '../../../members/dto/simple-member.dto';
import { SimpleGroupDto } from '../../../management/groups/dto/simple-group.dto';
import { SimpleOfficerDto } from '../../../management/officers/dto/simple-officer.dto';
import { LowAttendanceMemberDto } from '../../../home/dto/low-attendance-member.dto';

@Injectable()
export class WorshipEnrollmentDomainService
  implements IWorshipEnrollmentDomainService
{
  constructor(
    @InjectRepository(WorshipEnrollmentModel)
    private readonly repository: Repository<WorshipEnrollmentModel>,
  ) {}

  private getRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(WorshipEnrollmentModel)
      : this.repository;
  }

  private initEnrollmentQb(
    repository: Repository<WorshipEnrollmentModel>,
    worshipId: number,
  ) {
    return repository
      .createQueryBuilder('enrollment')
      .leftJoin('enrollment.member', 'member')
      .leftJoin('member.officer', 'officer')
      .leftJoin('member.group', 'group')
      .addSelect([
        'member.id',
        'member.name',
        'member.profileImageUrl',
        'member.groupRole',
        'member.birth',
        'member.isLunar',
        'member.isLeafMonth',
        'officer.id',
        'officer.name',
        'group.id',
        'group.name',
      ])
      .addSelect(
        `
        CASE
          WHEN enrollment."presentCount" + enrollment."absentCount" = 0 THEN 0
          ELSE enrollment."presentCount"::float / (enrollment."presentCount" + enrollment."absentCount")
        END`,
        'attendance_rate',
      )
      .where('enrollment.worshipId = :worshipId', { worshipId });
  }

  private applyOrderOption(
    qb: SelectQueryBuilder<WorshipEnrollmentModel>,
    dto: GetWorshipEnrollmentsDto,
  ) {
    switch (dto.order) {
      case WorshipEnrollmentOrderEnum.ATTENDANCE_RATE:
        qb.orderBy('attendance_rate', dto.orderDirection);
        break;
      case WorshipEnrollmentOrderEnum.NAME:
        qb.addOrderBy('member.name', dto.orderDirection);
        break;
      case WorshipEnrollmentOrderEnum.GROUP_NAME:
        qb.orderBy('group.name', dto.orderDirection); // 그룹 이름
        qb.addOrderBy('member.name', dto.orderDirection); // 교인 이름
        break;
      default:
        qb.orderBy(`enrollment.${dto.order}`, dto.orderDirection);
        break;
    }

    qb.addOrderBy('enrollment.id', 'ASC');
  }

  async findEnrollmentsByQueryBuilder(
    worship: WorshipModel,
    dto: GetWorshipEnrollmentsDto,
    groupIds?: number[],
    qr?: QueryRunner,
  ) {
    const repository = this.getRepository(qr);

    const qb = this.initEnrollmentQb(repository, worship.id);

    if (groupIds?.length) {
      qb.andWhere('member.groupId IN (:...groupIds)', { groupIds });
    }

    this.applyOrderOption(qb, dto);

    qb.skip(dto.take * (dto.page - 1)).take(dto.take);

    const [{ entities, raw }, totalCount] = await Promise.all([
      qb.getRawAndEntities(),
      qb.getCount(),
    ]);

    const data = entities.map((entity, i) => {
      const rate = Number(raw[i].attendance_rate);
      return {
        ...entity,
        attendanceRate: rate,
      };
    });

    return new WorshipEnrollmentDomainPaginationResultDto(data, totalCount);
  }

  async findAllEnrollments(
    worship: WorshipModel,
    qr?: QueryRunner,
  ): Promise<WorshipEnrollmentModel[]> {
    const repository = this.getRepository(qr);

    return repository.find({
      where: {
        worshipId: worship.id,
      },
    });
  }

  async refreshEnrollments(
    worship: WorshipModel,
    members: MemberModel[],
    qr?: QueryRunner,
  ) {
    const repository = this.getRepository(qr);

    const enrollments = repository.create(
      members.map((member) => ({
        worshipId: worship.id,
        memberId: member.id,
      })),
    );

    return repository.save(enrollments, { chunk: 100 });
  }

  createNewMemberEnrollments(
    newMember: MemberModel,
    worships: WorshipModel[],
    qr: QueryRunner,
  ): Promise<WorshipEnrollmentModel[]> {
    const repository = this.getRepository(qr);

    const newEnrollments = repository.create(
      worships.map((worship) => ({
        worshipId: worship.id,
        memberId: newMember.id,
      })),
    );

    return repository.save(newEnrollments, { chunk: 100 });
  }

  async createEnrollmentCascade(
    newWorship: WorshipModel,
    members: MemberModel[],
    qr: QueryRunner,
  ): Promise<WorshipEnrollmentModel[]> {
    const repository = this.getRepository(qr);

    const newEnrollments = repository.create(
      members.map((member) => ({
        memberId: member.id,
        worshipId: newWorship.id,
      })),
    );

    return repository.save(newEnrollments, { chunk: 100 });
  }

  async deleteEnrollmentCascade(deletedWorship: WorshipModel, qr: QueryRunner) {
    const repository = this.getRepository(qr);

    return repository.softDelete({
      worshipId: deletedWorship.id,
    });
  }

  async incrementPresentCount(
    enrollment: WorshipEnrollmentModel,
    qr: QueryRunner,
  ) {
    const repository = this.getRepository(qr);

    return repository.increment({ id: enrollment.id }, 'presentCount', 1);
  }

  async decrementPresentCount(
    enrollment: WorshipEnrollmentModel,
    qr: QueryRunner,
  ) {
    const repository = this.getRepository(qr);

    return repository.decrement({ id: enrollment.id }, 'presentCount', 1);
  }

  async incrementAbsentCount(
    enrollment: WorshipEnrollmentModel,
    qr: QueryRunner,
  ) {
    const repository = this.getRepository(qr);

    return repository.increment({ id: enrollment.id }, 'absentCount', 1);
  }

  async decrementAbsentCount(
    enrollment: WorshipEnrollmentModel,
    qr: QueryRunner,
  ) {
    const repository = this.getRepository(qr);

    return repository.decrement({ id: enrollment.id }, 'absentCount', 1);
  }

  async findLowAttendanceEnrollments(
    worship: WorshipModel,
    from: Date,
    to: Date,
    dto: GetLowWorshipAttendanceMembersDto,
    groupIds: number[],
  ): Promise<LowAttendanceMemberDto[]> {
    const repository = this.getRepository();

    const subQuery = repository
      .createQueryBuilder('enrollment')
      .leftJoin('enrollment.worshipAttendances', 'attendance')
      .select('enrollment.id', 'enrollmentId')
      .addSelect(
        `COUNT(*) FILTER (WHERE attendance.attendanceStatus IN ('present', 'absent'))`,
        'total',
      )
      .addSelect(
        `COUNT(*) FILTER (WHERE attendance.attendanceStatus IN ('present'))`,
        'presentCount',
      )
      .addSelect(
        `MAX(CASE WHEN attendance.attendanceStatus = 'present' THEN attendance.sessionDate ELSE NULL END)`,
        'lastPresentDate',
      )
      .where('enrollment.worshipId = :worshipId', { worshipId: worship.id })
      .andWhere('attendance.sessionDate BETWEEN :from AND :to', { from, to })
      .groupBy('enrollment.id');

    const query = repository
      .createQueryBuilder('enrollment')
      .innerJoin(
        `(${subQuery.getQuery()})`,
        'attendance_summary',
        'attendance_summary."enrollmentId" = enrollment.id',
      )
      .leftJoin('enrollment.member', 'member')
      .addSelect([
        'member.id',
        'member.name',
        'member.mobilePhone',
        'member.profileImageUrl',
        'member.birth',
        'member.isLunar',
        'member.isLeafMonth',
      ])
      .leftJoin('member.group', 'group')
      .addSelect(['group.id', 'group.name'])
      .leftJoin('member.officer', 'officer')
      .addSelect(['officer.id', 'officer.name'])
      .where('enrollment.worshipId = :worshipId', { worshipId: worship.id })
      .setParameters(subQuery.getParameters()) // 서브쿼리에서 사용한 파라미터도 반영
      .addSelect('attendance_summary.total', 'total')
      .addSelect('attendance_summary."presentCount"', 'presentCount')
      .addSelect('attendance_summary."lastPresentDate"', 'lastPresentDate')
      .addSelect(
        `CASE 
       WHEN attendance_summary.total::int = 0 THEN 0
       ELSE (attendance_summary."presentCount"::float / attendance_summary.total::float)
     END`,
        'attendanceRate',
      )
      .andWhere(
        `(attendance_summary."presentCount"::float / NULLIF(attendance_summary.total::float, 0)) <= :threshold`,
        { threshold: dto.threshold },
      );

    if (groupIds.length > 0) {
      query.andWhere('group.id IN (:...groupIds)', { groupIds });
    }

    if (dto.order === LowAttendanceOrder.NAME) {
      query.orderBy('member_name', dto.orderDirection);
    } else {
      query.orderBy(`"${dto.order}"`, dto.orderDirection);
    }

    query
      .addOrderBy('enrollment_id', dto.orderDirection)
      .limit(dto.take)
      .offset(dto.take * (dto.page - 1));

    const raw = await query.getRawMany();

    // 객체 매핑
    return raw.map((r) => {
      const member = new SimpleMemberDto(
        Number(r.member_id),
        r.member_name,
        r.member_mobilePhone,
        r.member_profileImageUrl,
        r.member_birth,
        r.member_isLunar,
        r.member_isLeafMonth,
        r.group_id
          ? new SimpleGroupDto(Number(r.group_id), r.group_name)
          : null,
        r.officer_id
          ? new SimpleOfficerDto(Number(r.officer_id), r.officer_name)
          : null,
      );

      return new LowAttendanceMemberDto(
        Number(r.enrollmentId),
        Number(r.total),
        Number(r.presentCount),
        r.lastPresentDate,
        r.attendanceRate,
        member,
      );
    });
  }

  /*async findEnrollments(
    worship: WorshipModel,
    dto: GetWorshipEnrollmentsDto,
    groupIds?: number[],
    qr?: QueryRunner,
  ) {
    const repository = this.getRepository(qr);

    const whereOptions: FindOptionsWhere<WorshipEnrollmentModel> = {
      worshipId: worship.id,
      member: {
        groupId: groupIds && In(groupIds),
      },
    };

    const orderOptions: FindOptionsOrder<WorshipEnrollmentModel> =
      this.parseOrderOption(dto);
    orderOptions.id = 'ASC';

    /!*if (dto.order !== WorshipEnrollmentOrderEnum.ID) {
      orderOptions.id = 'ASC';
    }*!/

    const [data, totalCount] = await Promise.all([
      repository.find({
        where: whereOptions,
        order: orderOptions,
        relations: {
          member: MemberSummarizedRelation,
        },
        select: {
          member: MemberSummarizedSelect,
        },
        take: dto.take,
        skip: dto.take * (dto.page - 1),
      }),
      repository.count({
        where: whereOptions,
      }),
    ]);

    return new WorshipEnrollmentDomainPaginationResultDto(data, totalCount);
  }*/
  /*private parseOrderOption(dto: GetWorshipEnrollmentsDto) {
      if (dto.order === WorshipEnrollmentOrderEnum.NAME) {
        const orderOptions: FindOptionsOrder<WorshipEnrollmentModel> = {
          member: {
            name: dto.orderDirection,
          },
        };

        return orderOptions;
      } else if (dto.order === WorshipEnrollmentOrderEnum.GROUP_NAME) {
        const orderOptions: FindOptionsOrder<WorshipEnrollmentModel> = {
          member: {
            group: {
              name: dto.orderDirection,
            },
            name: dto.orderDirection,
          },
        };

        return orderOptions;
      } else {
        const orderOptions: FindOptionsOrder<WorshipEnrollmentModel> = {
          //[dto.order]: dto.orderDirection,
        };
        return orderOptions;
      }
    }*/
  /*async updatePresentAbsentCount(
    enrollment: WorshipEnrollmentModel,
    presentCount: number,
    absentCount: number,
  ) {
    const repository = this.getRepository();

    return repository.update(
      {
        id: enrollment.id,
      },
      {
        presentCount: presentCount,
        absentCount: absentCount,
      },
    );
  }*/
}
