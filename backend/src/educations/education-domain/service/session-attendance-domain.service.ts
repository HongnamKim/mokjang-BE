import { ISessionAttendanceDomainService } from '../interface/session-attendance-domain.service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { SessionAttendanceModel } from '../../session-attendance/entity/session-attendance.entity';
import {
  FindOptionsOrder,
  FindOptionsRelations,
  In,
  IsNull,
  Not,
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
import { EducationEnrollmentModel } from '../../education-enrollment/entity/education-enrollment.entity';
import { EducationTermModel } from '../../education-term/entity/education-term.entity';
import {
  MemberSummarizedRelation,
  MemberSummarizedSelect,
} from '../../../members/const/member-find-options.const';
import { SessionAttendanceException } from '../../session-attendance/exception/session-attendance.exception';
import { UpdateAttendanceNoteDto } from '../../session-attendance/dto/request/update-attendance-note.dto';
import { SessionAttendanceStatus } from '../../session-attendance/const/session-attendance-status.enum';
import { UpdateAttendancePresentDto } from '../../session-attendance/dto/request/update-attendance-present.dto';

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
        status: SessionAttendanceStatus.PRESENT,
      },
    });
  }

  async findSessionAttendances(
    educationSession: EducationSessionModel,
    dto: GetAttendanceDto,
  ): Promise<SessionAttendanceModel[]> {
    const sessionAttendanceRepository = this.getSessionAttendanceRepository();

    const order: FindOptionsOrder<SessionAttendanceModel> = {
      [dto.order]: dto.orderDirection,
      id: dto.orderDirection,
    };

    return sessionAttendanceRepository.find({
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
          member: MemberSummarizedSelect,
        },
      },
      order,
      take: dto.take,
      skip: dto.take * (dto.page - 1),
    });
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

  findUnAttended(
    educationSession: EducationSessionModel,
    qr: QueryRunner,
  ): Promise<SessionAttendanceModel[]> {
    const repository = this.getSessionAttendanceRepository(qr);

    return repository.find({
      where: [
        {
          educationSessionId: educationSession.id,
          status: Not(SessionAttendanceStatus.PRESENT),
        },
      ],
    });
  }

  async bulkAttendance(
    sessionAttendances: SessionAttendanceModel[],
    qr: QueryRunner,
  ): Promise<UpdateResult> {
    const repository = this.getSessionAttendanceRepository(qr);

    const attendanceIds = sessionAttendances.map((sa) => sa.id);

    const result = await repository.update(
      {
        id: In(attendanceIds),
      },
      {
        status: SessionAttendanceStatus.PRESENT,
      },
    );

    if (result.affected !== attendanceIds.length) {
      throw new InternalServerErrorException(
        SessionAttendanceException.UPDATE_ERROR,
      );
    }

    return result;
  }

  async updateSessionAttendance(
    sessionAttendance: SessionAttendanceModel,
    dto: UpdateAttendancePresentDto | UpdateAttendanceNoteDto,
    qr?: QueryRunner,
  ): Promise<UpdateResult> {
    const sessionAttendanceRepository = this.getSessionAttendanceRepository(qr);

    const result = await sessionAttendanceRepository.update(
      {
        id: sessionAttendance.id,
        deletedAt: IsNull(),
      },
      {
        status:
          dto instanceof UpdateAttendancePresentDto ? dto.status : undefined,
        note: dto instanceof UpdateAttendanceNoteDto ? dto.note : undefined,
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

  deleteSessionAttendanceCascade(
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
