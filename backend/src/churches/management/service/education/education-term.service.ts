import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EducationTermModel } from '../../entity/education/education-term.entity';
import { FindOptionsRelations, QueryRunner, Repository } from 'typeorm';
import { GetEducationTermDto } from '../../dto/education/terms/get-education-term.dto';
import { EducationTermOrderEnum } from '../../const/education/order.enum';
import { CreateEducationTermDto } from '../../dto/education/terms/create-education-term.dto';
import { EducationException } from '../../const/exception/education/education.exception';
import { EducationModel } from '../../entity/education/education.entity';
import { MembersService } from '../../../members/service/members.service';
import { UpdateEducationTermDto } from '../../dto/education/terms/update-education-term.dto';
import { EducationSessionModel } from '../../entity/education/education-session.entity';
import { SessionAttendanceModel } from '../../entity/education/session-attendance.entity';

@Injectable()
export class EducationTermService {
  constructor(
    private readonly membersService: MembersService,
    @InjectRepository(EducationModel)
    private readonly educationsRepository: Repository<EducationModel>,
    @InjectRepository(EducationTermModel)
    private readonly educationTermsRepository: Repository<EducationTermModel>,
    @InjectRepository(EducationSessionModel)
    private readonly educationSessionsRepository: Repository<EducationSessionModel>,
    @InjectRepository(SessionAttendanceModel)
    private readonly sessionAttendanceRepository: Repository<SessionAttendanceModel>,
  ) {}

  private getEducationsRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(EducationModel)
      : this.educationsRepository;
  }

  private getEducationTermsRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(EducationTermModel)
      : this.educationTermsRepository;
  }

  private getEducationSessionsRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(EducationSessionModel)
      : this.educationSessionsRepository;
  }

  private getSessionAttendanceRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(SessionAttendanceModel)
      : this.sessionAttendanceRepository;
  }

  private async getEducationModelById(
    churchId: number,
    educationId: number,
    qr?: QueryRunner,
  ) {
    const educationsRepository = this.getEducationsRepository(qr);

    const education = await educationsRepository.findOne({
      where: {
        id: educationId,
        churchId,
      },
    });

    if (!education) {
      throw new NotFoundException(EducationException.NOT_FOUND);
    }

    return education;
  }

  async getEducationTerms(
    churchId: number,
    educationId: number,
    dto: GetEducationTermDto,
    qr?: QueryRunner,
  ) {
    const educationTermsRepository = this.getEducationTermsRepository(qr);

    const [result, totalCount] = await Promise.all([
      educationTermsRepository.find({
        where: {
          education: {
            churchId,
          },
          educationId: educationId,
        },
        order: {
          [dto.order]: dto.orderDirection,
          createdAt:
            dto.order === EducationTermOrderEnum.createdAt ? undefined : 'desc',
        },
        relations: {
          instructor: {
            officer: true,
            group: true,
            groupRole: true,
          },
        },
        take: dto.take,
        skip: dto.take * (dto.page - 1),
      }),
      educationTermsRepository.count({
        where: {
          education: {
            churchId,
          },
          educationId,
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

  async getEducationTermById(
    churchId: number,
    educationId: number,
    educationTermId: number,
    qr?: QueryRunner,
  ) {
    const educationTermsRepository = this.getEducationTermsRepository(qr);

    const educationTerm = await educationTermsRepository.findOne({
      where: {
        id: educationTermId,
        educationId,
        education: {
          churchId,
        },
      },
      relations: {
        instructor: {
          group: true,
          groupRole: true,
          officer: true,
        },
        /*educationEnrollments: {
          member: {
            group: true,
            groupRole: true,
            officer: true,
          },
        },*/
        educationSessions: true,
      },
    });

    if (!educationTerm) {
      throw new NotFoundException('해당 교육 기수를 찾을 수 없습니다.');
    }

    return educationTerm;
  }

  async getEducationTermModelById(
    churchId: number,
    educationId: number,
    educationTermId: number,
    qr?: QueryRunner,
    relations?: FindOptionsRelations<EducationTermModel>,
  ) {
    const educationTermsRepository = this.getEducationTermsRepository(qr);

    const educationTerm = await educationTermsRepository.findOne({
      where: {
        id: educationTermId,
        educationId,
        education: {
          churchId,
        },
      },
      relations: {
        //instructor: true,
        educationSessions: true,
        ...relations,
      },
    });

    if (!educationTerm) {
      throw new NotFoundException('해당 교육 기수를 찾을 수 없습니다.');
    }

    return educationTerm;
  }

  async isExistEducationTerm(
    educationId: number,
    term: number,
    qr?: QueryRunner,
  ) {
    const educationTermsRepository = this.getEducationTermsRepository(qr);

    const educationTerm = await educationTermsRepository.findOne({
      where: {
        educationId,
        term,
      },
    });

    return !!educationTerm;
  }

  async createEducationSessions(
    educationTermId: number,
    numberOfSessions: number,
    qr: QueryRunner,
  ) {
    const educationSessionsRepository = this.getEducationSessionsRepository(qr);

    await educationSessionsRepository.save(
      Array.from({ length: numberOfSessions }, (_, i) => ({
        session: i + 1,
        educationTermId: educationTermId,
      })),
    );
  }

  async createEducationTerm(
    churchId: number,
    educationId: number,
    dto: CreateEducationTermDto,
    qr: QueryRunner,
  ) {
    const educationTermsRepository = this.getEducationTermsRepository(qr);

    const education = await this.getEducationModelById(
      churchId,
      educationId,
      qr,
    );

    const instructor = dto.instructorId
      ? await this.membersService.getMemberModelById(
          churchId,
          dto.instructorId,
          {},
          qr,
        )
      : undefined;

    const isExistEducationTerm = await this.isExistEducationTerm(
      educationId,
      dto.term,
      qr,
    );

    if (isExistEducationTerm) {
      throw new BadRequestException('이미 존재하는 교육 기수입니다.');
    }

    const educationTerm = await educationTermsRepository.save({
      educationId,
      educationName: education.name,
      term: dto.term, //newTerm,
      numberOfSessions: dto.numberOfSessions,
      completionCriteria: dto.completionCriteria,
      startDate: dto.startDate,
      endDate: dto.endDate,
      instructor,
    });

    // 회차에 맞게 EducationSession 생성
    await this.createEducationSessions(
      educationTerm.id,
      educationTerm.numberOfSessions,
      qr,
    );

    return educationTermsRepository.findOne({
      where: { id: educationTerm.id },
      relations: { educationSessions: true },
    });
  }

  private validateUpdateEducationTerm(
    dto: UpdateEducationTermDto,
    educationTerm: EducationTermModel,
  ) {
    // 회자만 수정
    if (dto.numberOfSessions && !dto.completionCriteria) {
      if (
        educationTerm.completionCriteria &&
        dto.numberOfSessions < educationTerm.completionCriteria
      ) {
        throw new BadRequestException(
          '교육 회차는 이수 조건보다 크거나 같아야합니다.',
        );
      }
    }

    // 이수 조건만 수정
    if (dto.completionCriteria && !dto.numberOfSessions) {
      if (dto.completionCriteria > educationTerm.numberOfSessions) {
        throw new BadRequestException(
          '이수 조건은 교육 회차보다 작거나 같아야합니다.',
        );
      }
    }

    // 시작일만 수정
    if (dto.startDate && !dto.endDate) {
      if (dto.startDate > educationTerm.endDate) {
        throw new BadRequestException(
          '교육 시작일은 종료일보다 뒤일 수 없습니다.',
        );
      }
    }

    // 종료일만 수정
    if (dto.endDate && !dto.startDate) {
      if (educationTerm.startDate > dto.endDate) {
        throw new BadRequestException(
          '교육 종료일은 시작일보다 앞설 수 없습니다.',
        );
      }
    }
  }

  async updateEducationTerm(
    churchId: number,
    educationId: number,
    educationTermId: number,
    dto: UpdateEducationTermDto,
    qr: QueryRunner,
  ) {
    const educationTermsRepository = this.getEducationTermsRepository(qr);

    const educationTerm = await this.getEducationTermModelById(
      churchId,
      educationId,
      educationTermId,
      qr,
      { educationEnrollments: true },
    );

    /*
    1. 교육회차만 업데이트
      1-1. 기존 이수조건보다 큰 경우 --> 정상 업데이트
      1-2. 기존 이수조건보다 작은 경우 --> 교육회차는 이수조건보다 크거나 같아야함. BadRequestException

    2. 교육회차 + 이수조건 업데이트
      2-1. DTO 에서 교육회차가 이수조건 이상으로 검증 --> 정상 업데이트

    3. 이수조건 업데이트
      3-1. 교육회차보다 이하인 경우 --> 정상 업데이트
      3-2. 교육회차보다 큰 경우 --> 이수조건은 교육회차보다 작거나 같아야함. BadRequestException

    4. 시작일 업데이트
      4-1. 기존 종료일보다 앞선 경우 --> 정상 업데이트
      4-2. 기존 종요일보다 뒤인 경우 --> 시작일은 종료일 뒤의 날짜일 수 없음. BadRequestException

    5. 시작일 + 종료일 업데이트
      5-1. DTO 에서 검증 완료 --> 정상 업데이트

    6. 종료일 업데이트
      6-1. 기존 시작일보다 뒤인 경우 --> 정상 업데이트
      6-2. 기존 시작일보다 앞일 경우 --> 종료일은 시작일을 앞설 수 없음. BadRequestException

    7. 진행자 업데이트
      7-1. 진행자가 해당 교회에 소속 --> 정상 업데이트
      7-2. 진행자가 해당 교회에 소속X --> 해당 교인을 찾을 수 없음. NotFoundException
     */

    this.validateUpdateEducationTerm(dto, educationTerm);

    const instructor = dto.instructorId
      ? await this.membersService.getMemberModelById(
          churchId,
          dto.instructorId,
          {},
          qr,
        )
      : undefined;

    if (dto.term) {
      const isExistEducationTerm = await this.isExistEducationTerm(
        educationId,
        dto.term,
        qr,
      );

      if (isExistEducationTerm) {
        throw new BadRequestException('이미 존재하는 교육 기수입니다.');
      }
    }

    // 회차 수정 시
    // 회차 감소 --> 회차 삭제 X, 수동 삭제
    // 회차 증가 --> 회차 생성
    if (
      dto.numberOfSessions &&
      dto.numberOfSessions > educationTerm.educationSessions.length
    ) {
      const educationSessionsRepository =
        this.getEducationSessionsRepository(qr);

      // dto: 8, term: 5 --> session 6, 7, 8 생성
      const newSessions = await educationSessionsRepository.save(
        Array.from(
          {
            length:
              dto.numberOfSessions - educationTerm.educationSessions.length,
          },
          (_, index) => ({
            educationTermId,
            session: educationTerm.educationSessions.length + index + 1,
          }),
        ),
      );

      // 증가된 세션에 대한 출석 정보 생성
      const newSessionIds = newSessions.map((newSession) => newSession.id);
      const enrollmentIds = educationTerm.educationEnrollments.map(
        (enrollment) => enrollment.id,
      );

      const sessionAttendanceRepository =
        this.getSessionAttendanceRepository(qr);

      const attendances = newSessionIds.flatMap((sessionId) =>
        enrollmentIds.map((enrollmentId) => ({
          educationSessionId: sessionId,
          educationEnrollmentId: enrollmentId,
        })),
      );

      await sessionAttendanceRepository.save(attendances);
    }

    await educationTermsRepository.update(
      {
        id: educationTermId,
      },
      {
        ...dto,
        instructor: instructor,
      },
    );

    return educationTermsRepository.findOne({ where: { id: educationTermId } });
  }

  async deleteEducationTerm(
    educationId: number,
    educationTermId: number,
    qr?: QueryRunner,
  ) {
    const educationTermsRepository = this.getEducationTermsRepository(qr);

    const result = await educationTermsRepository.softDelete({
      educationId,
      id: educationTermId,
    });

    if (result.affected === 0) {
      throw new NotFoundException('해당 교육 기수를 찾을 수 없습니다.');
    }

    return `educationTermId: ${educationTermId} deleted`;
  }

  async syncSessionAttendances(
    churchId: number,
    educationId: number,
    educationTermId: number,
    qr: QueryRunner,
  ) {
    type AttendanceKey = {
      educationSessionId: number;
      educationEnrollmentId: number;
    };

    const sessionAttendanceRepository = this.getSessionAttendanceRepository(qr);
    const educationTermsRepository = this.getEducationTermsRepository(qr);

    const [currentSessionAttendances, educationTerm] = await Promise.all([
      sessionAttendanceRepository.find({
        where: {
          educationSession: {
            educationTermId,
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

      educationTermsRepository.findOne({
        where: {
          id: educationTermId,
          educationId,
          education: {
            churchId,
          },
        },
        relations: {
          educationSessions: true,
          educationEnrollments: true,
        },
        select: {
          educationSessions: {
            id: true,
          },
          educationEnrollments: {
            id: true,
          },
        },
      }),
    ]);

    if (!educationTerm) {
      throw new NotFoundException('해당 교육 기수를 찾을 수 없습니다.');
    }

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
