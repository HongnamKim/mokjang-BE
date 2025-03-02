import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SessionAttendanceModel } from '../../entity/education/session-attendance.entity';
import { QueryRunner, Repository } from 'typeorm';
import { GetAttendanceDto } from '../../dto/education/attendance/get-attendance.dto';
import { UpdateAttendanceDto } from '../../dto/education/attendance/update-attendance.dto';
import { EducationEnrollmentModel } from '../../entity/education/education-enrollment.entity';

@Injectable()
export class SessionAttendanceService {
  constructor(
    @InjectRepository(EducationEnrollmentModel)
    private readonly educationEnrollmentsRepository: Repository<EducationEnrollmentModel>,
    @InjectRepository(SessionAttendanceModel)
    private readonly sessionAttendanceRepository: Repository<SessionAttendanceModel>,
  ) {}

  private getEducationEnrollmentsRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(EducationEnrollmentModel)
      : this.educationEnrollmentsRepository;
  }

  private getSessionAttendanceRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(SessionAttendanceModel)
      : this.sessionAttendanceRepository;
  }

  async getSessionAttendance(
    churchId: number,
    educationId: number,
    educationTermId: number,
    educationSessionId: number,
    dto: GetAttendanceDto,
  ) {
    const sessionAttendanceRepository = this.getSessionAttendanceRepository();

    const [result, totalCount] = await Promise.all([
      sessionAttendanceRepository.find({
        where: {
          educationSession: {
            educationTermId,
            educationTerm: {
              educationId,
              education: {
                churchId,
              },
            },
          },
          educationSessionId,
        },
        relations: {
          educationEnrollment: {
            member: {
              group: true,
              groupRole: true,
              officer: true,
            },
          },
        },
        order: {
          [dto.order]: dto.orderDirection,
        },
        take: dto.take,
        skip: dto.take * (dto.page - 1),
      }),
      sessionAttendanceRepository.count({
        where: {
          educationSessionId,
        },
      }),
    ]);

    return {
      data: result,
      totalCount,
      count: result.length,
      page: dto.page,
    };
  }

  async getSessionAttendanceModelById(
    churchId: number,
    educationId: number,
    educationTermId: number,
    educationSessionId: number,
    sessionAttendanceId: number,
    qr?: QueryRunner,
  ) {
    const sessionAttendanceRepository = this.getSessionAttendanceRepository(qr);

    const sessionAttendance = await sessionAttendanceRepository.findOne({
      where: {
        id: sessionAttendanceId,
        educationSessionId,
        educationSession: {
          educationTermId,
          educationTerm: {
            educationId,
            education: {
              churchId,
            },
          },
        },
      },
    });

    if (!sessionAttendance) {
      throw new NotFoundException('해당 세션 출석 정보를 찾을 수 없습니다.');
    }

    return sessionAttendance;
  }

  async updateSessionAttendance(
    churchId: number,
    educationId: number,
    educationTermId: number,
    educationSessionId: number,
    sessionAttendanceId: number,
    dto: UpdateAttendanceDto,
    qr: QueryRunner,
  ) {
    // 출석 업데이트 시 Enrollment 의 출석 횟수 변경
    // sessionAttendance, educationEnrollment 필요

    /**
     * 업데이트 대상
     *  1. 출석 --> sessionAttendance, educationEnrollment 수정
     *  2. 비고 --> sessionAttendance 만 수정
     */
    const sessionAttendanceRepository = this.getSessionAttendanceRepository(qr);

    const sessionAttendance = await this.getSessionAttendanceModelById(
      churchId,
      educationId,
      educationTermId,
      educationSessionId,
      sessionAttendanceId,
    );

    // sessionAttendance 업데이트
    await sessionAttendanceRepository.update(
      {
        id: sessionAttendanceId,
      },
      {
        isPresent: dto.isPresent,
        note: dto.note,
      },
    );

    // 출석 정보 업데이트 시
    // isPresent 가 boolean 이기 때문에 undefined 로 판단
    if (dto.isPresent !== undefined) {
      await this.updateAttendanceCount(sessionAttendance, qr);
    }

    return sessionAttendanceRepository.findOne({
      where: {
        id: sessionAttendanceId,
      },
    });
  }

  private async updateAttendanceCount(
    sessionAttendance: SessionAttendanceModel,
    qr: QueryRunner,
  ) {
    const sessionAttendanceRepository = this.getSessionAttendanceRepository(qr);
    const educationEnrollmentsRepository =
      this.getEducationEnrollmentsRepository(qr);

    const [enrollment, attendanceCount] = await Promise.all([
      educationEnrollmentsRepository.findOne({
        where: {
          id: sessionAttendance.educationEnrollmentId,
        },
      }),
      sessionAttendanceRepository.count({
        where: {
          educationEnrollmentId: sessionAttendance.educationEnrollmentId,
          isPresent: true,
        },
      }),
    ]);

    if (!enrollment) {
      throw new NotFoundException('해당 교육 대상자 내역을 찾을 수 없습니다.');
    }

    await educationEnrollmentsRepository.update(
      {
        id: enrollment.id,
      },
      {
        attendanceCount: attendanceCount,
      },
    );
  }
}
