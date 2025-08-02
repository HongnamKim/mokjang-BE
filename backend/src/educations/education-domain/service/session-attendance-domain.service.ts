import { ISessionAttendanceDomainService } from '../interface/session-attendance-domain.service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { SessionAttendanceModel } from '../../session-attendance/entity/session-attendance.entity';
import {
  FindOptionsRelations,
  IsNull,
  QueryRunner,
  Repository,
  UpdateResult,
} from 'typeorm';
import { EducationSessionModel } from '../../education-session/entity/education-session.entity';
import { GetAttendanceDto } from '../../session-attendance/dto/request/get-attendance.dto';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UpdateAttendanceDto } from '../../session-attendance/dto/request/update-attendance.dto';
import { EducationEnrollmentModel } from '../../education-enrollment/entity/education-enrollment.entity';
import { EducationTermModel } from '../../education-term/entity/education-term.entity';
import {
  MemberSummarizedRelation,
  MemberSummarizedSelect,
} from '../../../members/const/member-find-options.const';
import { SessionAttendanceException } from '../../session-attendance/exception/session-attendance.exception';
import { AttendanceOrderEnum } from '../../session-attendance/const/attendance-order.enum';

export class SessionAttendanceDomainService
  implements ISessionAttendanceDomainService
{
  constructor(
    @InjectRepository(SessionAttendanceModel)
    private readonly sessionAttendanceRepository: Repository<SessionAttendanceModel>,
  ) {}

  private getSessionAttendanceRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(SessionAttendanceModel)
      : this.sessionAttendanceRepository;
  }

  async createSessionAttendance(
    newSession: EducationSessionModel,
    educationEnrollments: EducationEnrollmentModel[],
    qr: QueryRunner,
  ) {
    const sessionAttendanceRepository = this.getSessionAttendanceRepository(qr);

    return sessionAttendanceRepository.save(
      educationEnrollments.map((enrollment) => ({
        educationSessionId: newSession.id,
        educationEnrollmentId: enrollment.id,
      })),
    );
  }

  createSessionAttendanceForNewEnrollment(
    enrollments: EducationEnrollmentModel[],
    educationSessionIds: number[],
    qr: QueryRunner,
  ): Promise<SessionAttendanceModel[]> {
    const repository = this.getSessionAttendanceRepository(qr);

    const attendances = repository.create(
      enrollments
        .map((enrollment) =>
          educationSessionIds.map((sessionId) => ({
            educationSessionId: sessionId,
            educationEnrollmentId: enrollment.id,
          })),
        )
        .flat(),
    );

    return repository.save(attendances);
  }

  async createAdditionalSessionAttendance(
    newSessionIds: number[],
    enrollmentIds: number[],
    qr: QueryRunner,
  ) {
    const sessionAttendanceRepository = this.getSessionAttendanceRepository(qr);

    const attendances = newSessionIds.flatMap((sessionId) =>
      enrollmentIds.map((enrollmentId) => ({
        educationSessionId: sessionId,
        educationEnrollmentId: enrollmentId,
      })),
    );

    return sessionAttendanceRepository.save(attendances);
  }

  async findAttendedSessionAttendances(
    educationSession: EducationSessionModel,
    qr: QueryRunner,
  ) {
    const sessionAttendanceRepository = this.getSessionAttendanceRepository(qr);

    return await sessionAttendanceRepository.find({
      where: {
        educationSessionId: educationSession.id,
        isPresent: true,
      },
    });
  }

  async findSessionAttendances(
    educationSession: EducationSessionModel,
    dto: GetAttendanceDto,
  ): Promise<{ data: SessionAttendanceModel[]; totalCount: number }> {
    const sessionAttendanceRepository = this.getSessionAttendanceRepository();

    const order: Partial<
      Record<AttendanceOrderEnum, 'asc' | 'desc' | 'ASC' | 'DESC'>
    > = {
      [dto.order]: dto.orderDirection,
    };

    if (dto.order !== AttendanceOrderEnum.createdAt) {
      order.createdAt = 'desc';
    }
    const [result, totalCount] = await Promise.all([
      sessionAttendanceRepository.find({
        where: {
          educationSessionId: educationSession.id,
        },
        relations: {
          educationEnrollment: {
            member: MemberSummarizedRelation,
          },
        },
        select: {
          educationEnrollment: {
            id: true,
            createdAt: true,
            updatedAt: true,
            memberId: true,
            educationTermId: true,
            status: true,
            attendanceCount: true,
            //note: true,
            member: MemberSummarizedSelect,
          },
        },
        order,
        take: dto.take,
        skip: dto.take * (dto.page - 1),
      }),

      sessionAttendanceRepository.count({
        where: {
          educationSessionId: educationSession.id,
        },
      }),
    ]);

    return {
      data: result,
      totalCount,
    };
  }

  async findSessionAttendanceModelById(
    educationSession: EducationSessionModel,
    sessionAttendanceId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<SessionAttendanceModel>,
  ): Promise<SessionAttendanceModel> {
    const sessionAttendanceRepository = this.getSessionAttendanceRepository(qr);

    const sessionAttendance = await sessionAttendanceRepository.findOne({
      where: {
        educationSessionId: educationSession.id,
        id: sessionAttendanceId,
      },
      relations: relationOptions,
    });

    if (!sessionAttendance) {
      throw new NotFoundException(SessionAttendanceException.NOT_FOUND);
    }

    return sessionAttendance;
  }

  async updateSessionAttendance(
    sessionAttendance: SessionAttendanceModel,
    dto: UpdateAttendanceDto,
    qr: QueryRunner,
  ): Promise<UpdateResult> {
    const sessionAttendanceRepository = this.getSessionAttendanceRepository(qr);

    const result = await sessionAttendanceRepository.update(
      {
        id: sessionAttendance.id,
        deletedAt: IsNull(),
      },
      {
        isPresent: dto.isPresent,
        note: dto.note,
      },
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(
        SessionAttendanceException.UPDATE_ERROR,
      );
    }

    return result;
  }

  async deleteSessionAttendancesBySessionDeletion(
    deletedSessionId: number,
    qr: QueryRunner,
  ) {
    const sessionAttendanceRepository = this.getSessionAttendanceRepository(qr);

    return sessionAttendanceRepository.softDelete({
      educationSessionId: deletedSessionId,
    });
  }

  deleteSessionAttendanceByEnrollmentDeletion(
    enrollment: EducationEnrollmentModel,
    qr: QueryRunner,
  ): Promise<UpdateResult> {
    const sessionAttendanceRepository = this.getSessionAttendanceRepository(qr);
    return sessionAttendanceRepository.softDelete({
      educationEnrollmentId: enrollment.id,
    });
  }

  async syncSessionAttendances(
    educationTerm: EducationTermModel,
    qr: QueryRunner,
  ) {
    type AttendanceKey = {
      educationSessionId: number;
      educationEnrollmentId: number;
    };

    const sessionAttendanceRepository = this.getSessionAttendanceRepository(qr);

    const [currentSessionAttendances] = await Promise.all([
      sessionAttendanceRepository.find({
        where: {
          educationSession: {
            educationTermId: educationTerm.id,
          },
        },
        order: {
          educationEnrollmentId: 'asc',
          educationSessionId: 'asc',
        },
        select: {
          educationSessionId: true,
          educationEnrollmentId: true,
        },
      }),
    ]);

    const totalExpectedAttendances =
      educationTerm.educationEnrollments.length *
      educationTerm.educationSessions.length;

    if (currentSessionAttendances.length === totalExpectedAttendances) {
      throw new BadRequestException('모든 출석 정보가 이미 존재합니다.');
    }

    const createAttendanceKey = (attendance: AttendanceKey) =>
      `${attendance.educationSessionId}-${attendance.educationEnrollmentId}`;

    const currentAttendancesMap = new Set(
      currentSessionAttendances.map(createAttendanceKey),
    );

    const missingAttendances = educationTerm.educationEnrollments
      .flatMap((enrollment) =>
        educationTerm.educationSessions.map((session) => ({
          educationSessionId: session.id,
          educationEnrollmentId: enrollment.id,
        })),
      )
      .filter(
        (attendance) =>
          !currentAttendancesMap.has(createAttendanceKey(attendance)),
      );

    if (missingAttendances.length > 0) {
      return sessionAttendanceRepository.save(missingAttendances);
    }

    return [];
  }
}
