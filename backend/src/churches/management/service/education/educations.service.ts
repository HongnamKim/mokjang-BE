import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, MoreThan, QueryRunner, Repository } from 'typeorm';
import { EducationStatus } from '../../const/education/education-status.enum';
import { EducationModel } from '../../entity/education/education.entity';
import { GetEducationDto } from '../../dto/education/education/get-education.dto';
import { CreateEducationDto } from '../../dto/education/education/create-education.dto';
import { UpdateEducationDto } from '../../dto/education/education/update-education.dto';
import { EducationException } from '../../const/exception/education/education.exception';
import { EducationTermModel } from '../../entity/education/education-term.entity';
import { GetEducationTermDto } from '../../dto/education/terms/get-education-term.dto';
import {
  EducationEnrollmentOrderEnum,
  EducationOrderEnum,
  EducationTermOrderEnum,
} from '../../const/education/order.enum';
import { CreateEducationTermDto } from '../../dto/education/terms/create-education-term.dto';
import { UpdateEducationTermDto } from '../../dto/education/terms/update-education-term.dto';
import { MembersService } from '../../../members/service/members.service';
import { EducationEnrollmentModel } from '../../entity/education/education-enrollment.entity';
import { CreateEducationEnrollmentDto } from '../../dto/education/enrollments/create-education-enrollment.dto';
import { GetEducationEnrollmentDto } from '../../dto/education/enrollments/get-education-enrollment.dto';
import { UpdateEducationEnrollmentDto } from '../../dto/education/enrollments/update-education-enrollment.dto';
import { EducationSessionModel } from '../../entity/education/education-session.entity';
import { UpdateEducationSessionDto } from '../../dto/education/sessions/update-education-session.dto';
import { SessionAttendanceModel } from '../../entity/education/session-attendance.entity';
import { UpdateAttendanceDto } from '../../dto/education/attendance/update-attendance.dto';

@Injectable()
export class EducationsService {
  constructor(
    @InjectRepository(EducationModel)
    private readonly educationsRepository: Repository<EducationModel>,
    @InjectRepository(EducationTermModel)
    private readonly educationTermsRepository: Repository<EducationTermModel>,
    @InjectRepository(EducationEnrollmentModel)
    private readonly educationEnrollmentsRepository: Repository<EducationEnrollmentModel>,
    @InjectRepository(EducationSessionModel)
    private readonly educationSessionsRepository: Repository<EducationSessionModel>,
    @InjectRepository(SessionAttendanceModel)
    private readonly sessionAttendanceRepository: Repository<SessionAttendanceModel>,
    private readonly membersService: MembersService,
  ) {}

  private CountColumnMap = {
    [EducationStatus.IN_PROGRESS]: 'inProgressCount',
    [EducationStatus.COMPLETED]: 'completedCount',
    [EducationStatus.INCOMPLETE]: 'incompleteCount',
  };

  private getEducationsRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(EducationModel)
      : this.educationsRepository;
  }

  async getEducations(
    churchId: number,
    dto: GetEducationDto,
    qr?: QueryRunner,
  ) {
    const educationsRepository = this.getEducationsRepository(qr);

    const [result, totalCount] = await Promise.all([
      educationsRepository.find({
        where: {
          churchId,
        },
        order: {
          [dto.order]: dto.orderDirection,
          createdAt:
            dto.order === EducationOrderEnum.createdAt ? undefined : 'desc',
        },
        take: dto.take,
        skip: dto.take * (dto.page - 1),
      }),
      educationsRepository.count({
        where: {
          churchId,
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

  async getEducationById(
    churchId: number,
    educationId: number,
    qr?: QueryRunner,
  ) {
    const educationsRepository = this.getEducationsRepository(qr);

    const education = await educationsRepository.findOne({
      where: {
        churchId,
        id: educationId,
      },
      relations: {
        educationTerms: {
          instructor: true,
        },
      },
      order: {
        educationTerms: {
          term: 'asc',
        },
      },
    });

    if (!education) {
      throw new BadRequestException(EducationException.NOT_FOUND);
    }

    return education;
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

  async isExistEducation(
    churchId: number,
    educationName: string,
    withDeleted: boolean,
    qr?: QueryRunner,
  ) {
    const educationsRepository = this.getEducationsRepository(qr);

    return educationsRepository.findOne({
      where: {
        churchId,
        name: educationName,
      },
      withDeleted,
    });
  }

  async createEducation(
    churchId: number,
    dto: CreateEducationDto,
    qr?: QueryRunner,
  ) {
    const educationsRepository = this.getEducationsRepository(qr);

    // 교육 이름 중복 체크
    const existEducation = await this.isExistEducation(
      churchId,
      dto.name,
      false,
      qr,
    );

    if (existEducation) {
      throw new BadRequestException(EducationException.ALREADY_EXIST);
    }

    console.log(dto.description);

    return educationsRepository.save({
      name: dto.name,
      description: dto.description,
      churchId,
    });
  }

  async updateEducation(
    churchId: number,
    educationId: number,
    dto: UpdateEducationDto,
    qr?: QueryRunner,
  ) {
    const educationsRepository = this.getEducationsRepository(qr);

    const education = await educationsRepository.findOne({
      where: {
        churchId,
        id: educationId,
      },
    });

    if (!education) {
      throw new NotFoundException(EducationException.NOT_FOUND);
    }

    // 바꾸려는 이름이 존재하는 지 확인
    const existEducation = dto.name
      ? await this.isExistEducation(churchId, dto.name, false, qr)
      : false;

    if (existEducation) {
      throw new BadRequestException(EducationException.ALREADY_EXIST);
    }

    await educationsRepository.update(
      {
        id: educationId,
      },
      {
        name: dto.name,
        description: dto.description,
      },
    );

    // 이름 변경 시 하위 기수들의 교육명 업데이트
    if (dto.name) {
      const educationTermsRepository = this.getEducationTermsRepository(qr);

      await educationTermsRepository.update(
        {
          educationId,
        },
        {
          educationName: dto.name,
        },
      );
    }

    return educationsRepository.findOne({ where: { id: educationId } });
  }

  async deleteEducation(
    churchId: number,
    educationId: number,
    qr?: QueryRunner,
  ) {
    const educationsRepository = this.getEducationsRepository(qr);

    const result = await educationsRepository.softDelete({
      id: educationId,
      churchId,
    });

    if (result.affected === 0) {
      throw new NotFoundException(EducationException.NOT_FOUND);
    }

    return `educationId: ${educationId} deleted`;
  }

  private getEducationTermsRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(EducationTermModel)
      : this.educationTermsRepository;
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
        educationEnrollments: {
          member: {
            group: true,
            groupRole: true,
            officer: true,
          },
        },
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
    qr?: QueryRunner,
  ) {
    const educationTermsRepository = this.getEducationTermsRepository(qr);

    const educationTerm = await this.getEducationTermModelById(
      churchId,
      educationId,
      educationTermId,
      qr,
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
    if (dto.numberOfSessions) {
      // 회차 감소 --> 회차 삭제 X, 수동 삭제
      // 회차 증가 --> 회차 생성
      if (dto.numberOfSessions > educationTerm.educationSessions.length) {
        const educationSessionsRepository =
          this.getEducationSessionsRepository(qr);

        // dto: 8, term: 5 --> session 6, 7, 8 생성
        await educationSessionsRepository.save(
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
      }
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

  private getEducationSessionsRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(EducationSessionModel)
      : this.educationSessionsRepository;
  }

  async getEducationSessions(educationTermId: number) {
    const educationSessionsRepository = this.getEducationSessionsRepository();

    return educationSessionsRepository.find({
      where: {
        educationTermId,
      },
      order: {
        session: 'asc',
      },
    });
  }

  async getEducationSessionById(
    educationTermId: number,
    educationSessionId: number,
    qr?: QueryRunner,
  ) {
    const educationSessionsRepository = this.getEducationSessionsRepository(qr);

    const session = await educationSessionsRepository.findOne({
      where: {
        id: educationSessionId,
        educationTermId,
      },
      /*relations: {
        sessionAttendances: true,
      },*/
    });

    if (!session) {
      throw new NotFoundException('해당 교육 세션을 찾을 수 없습니다.');
    }

    return session;
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

  async createSingleEducationSession(
    educationId: number,
    educationTermId: number,
    qr: QueryRunner,
  ) {
    const educationTermsRepository = this.getEducationTermsRepository(qr);
    const educationSessionsRepository = this.getEducationSessionsRepository(qr);

    const educationTerm = await educationTermsRepository.findOne({
      where: {
        id: educationTermId,
        educationId,
      },
    });

    if (!educationTerm) {
      throw new NotFoundException('해당 교육 기수를 찾을 수 없습니다.');
    }

    const lastSession = await educationSessionsRepository.findOne({
      where: {
        educationTermId: educationTermId,
      },
      order: {
        session: 'desc',
      },
    });

    const newSessionNumber = lastSession ? lastSession.session + 1 : 1;

    // 교육 세션 생성
    const newSession = await educationSessionsRepository.save({
      session: newSessionNumber,
      educationTermId,
    });

    // 교육 세션 개수 업데이트
    await educationTermsRepository.update(
      { id: educationTermId },
      {
        numberOfSessions: () => '"numberOfSessions" + 1',
      },
    );

    return this.getEducationSessionById(educationTermId, newSession.id, qr);
  }

  async updateEducationSession(
    educationTermId: number,
    educationSessionId: number,
    dto: UpdateEducationSessionDto,
    qr?: QueryRunner,
  ) {
    const educationSessionsRepository = this.getEducationSessionsRepository(qr);

    const result = await educationSessionsRepository.update(
      {
        id: educationSessionId,
        educationTermId,
      },
      {
        content: dto.deleteContent ? null : dto.content,
      },
    );

    if (result.affected === 0) {
      throw new NotFoundException('해당 교육 회차를 찾을 수 없습니다.');
    }

    return educationSessionsRepository.findOne({
      where: { id: educationSessionId },
    });
  }

  async deleteEducationSessions(
    educationTermId: number,
    educationSessionId: number,
    qr: QueryRunner,
    cascade?: boolean,
  ) {
    const educationSessionsRepository = this.getEducationSessionsRepository(qr);

    const targetSession = await this.getEducationSessionById(
      educationTermId,
      educationSessionId,
      qr,
    );

    // 세션 삭제
    await educationSessionsRepository.softDelete({
      id: educationSessionId,
      educationTermId,
    });

    const educationTermsRepository = this.getEducationTermsRepository(qr);

    // 다른 회차들 session 번호 수정
    await educationSessionsRepository.update(
      {
        educationTermId,
        session: MoreThan(targetSession.session),
      },
      {
        session: () => '"session" - 1',
      },
    );

    // 해당 기수의 세션 개수 업데이트
    const newNumberOfSessions = await educationSessionsRepository.count({
      where: { educationTermId },
    });

    await educationTermsRepository.update(
      { id: educationTermId },
      {
        numberOfSessions: newNumberOfSessions,
      },
    );

    // 해당 세션 하위의 출석 정보 삭제
    if (cascade) {
      // 해당 세션의 출석 정보 삭제
      const sessionAttendanceRepository =
        this.getSessionAttendanceRepository(qr);

      await sessionAttendanceRepository.softDelete({
        educationSessionId: educationSessionId,
      });

      // 교육 대상자들의 출석 횟수 수정
      const educationTerm = await educationTermsRepository.findOne({
        where: { id: educationTermId },
        relations: { educationEnrollments: true },
      });

      if (!educationTerm) {
        throw new NotFoundException('해당 교육 기수가 존재하지 않습니다.');
      }

      const educationEnrollments = educationTerm.educationEnrollments;
      const educationEnrollmentsRepository =
        this.getEducationEnrollmentsRepository(qr);

      for (const enrollment of educationEnrollments) {
        // 출석 횟수
        const newAttendanceCount = await sessionAttendanceRepository.count({
          where: {
            educationEnrollmentId: enrollment.id,
            isPresent: true,
          },
        });

        await educationEnrollmentsRepository.update(
          {
            id: enrollment.id,
          },
          {
            attendanceCount: newAttendanceCount,
          },
        );
      }
    }

    return `educationSessionId: ${educationSessionId} deleted`;
  }

  private getEducationEnrollmentsRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(EducationEnrollmentModel)
      : this.educationEnrollmentsRepository;
  }

  async getEducationEnrollments(
    churchId: number,
    educationId: number,
    educationTermId: number,
    dto: GetEducationEnrollmentDto,
    qr?: QueryRunner,
  ) {
    const educationEnrollmentsRepository =
      this.getEducationEnrollmentsRepository(qr);

    return educationEnrollmentsRepository.find({
      where: {
        educationTermId,
      },
      relations: {
        member: true,
      },
      order: {
        [dto.order]: dto.orderDirection,
        createdAt:
          dto.order === EducationEnrollmentOrderEnum.createdAt
            ? undefined
            : 'desc',
      },
    });
  }

  async getEducationEnrollmentModelById(
    educationEnrollmentId: number,
    qr?: QueryRunner,
  ) {
    const educationEnrollmentsRepository =
      this.getEducationEnrollmentsRepository(qr);

    const enrollment = await educationEnrollmentsRepository.findOne({
      where: {
        id: educationEnrollmentId,
      },
    });

    if (!enrollment) {
      throw new NotFoundException('해당 교육 대상자 내역을 찾을 수 없습니다.');
    }

    return enrollment;
  }

  async getEducationEnrollmentById(
    educationTermId: number,
    educationEnrollmentId: number,
    qr?: QueryRunner,
  ) {
    const educationEnrollmentsRepository =
      this.getEducationEnrollmentsRepository(qr);

    const enrollment = await educationEnrollmentsRepository.findOne({
      where: {
        educationTermId,
        id: educationEnrollmentId,
      },
    });

    if (!enrollment) {
      throw new NotFoundException('해당 교육 대상자 내역을 찾을 수 없습니다.');
    }

    return enrollment;
  }

  async isExistEnrollment(
    educationTermId: number,
    memberId: number,
    qr?: QueryRunner,
  ) {
    const educationEnrollmentsRepository =
      this.getEducationEnrollmentsRepository(qr);

    const enrollment = await educationEnrollmentsRepository.findOne({
      where: {
        educationTermId,
        memberId,
      },
    });

    return !!enrollment;
  }

  async createEducationEnrollment(
    churchId: number,
    educationId: number,
    educationTermId: number,
    dto: CreateEducationEnrollmentDto,
    qr: QueryRunner,
  ) {
    const educationEnrollmentsRepository =
      this.getEducationEnrollmentsRepository();

    const educationTerm = await this.getEducationTermModelById(
      churchId,
      educationId,
      educationTermId,
      qr,
    );

    const isExistEnrollment = await this.isExistEnrollment(
      educationTermId,
      dto.memberId,
      qr,
    );

    if (isExistEnrollment) {
      throw new BadRequestException('이미 교육 대상자로 등록된 교인입니다.');
    }

    // 수강 대상 교인 수 증가
    await this.incrementEnrollmentCount(educationTermId, qr);
    await this.incrementEducationStatusCount(educationTermId, dto.status, qr);

    const member = await this.membersService.getMemberModelById(
      churchId,
      dto.memberId,
      {},
      qr,
    );

    const enrollment = await educationEnrollmentsRepository.save({
      memberName: member.name,
      member,
      educationTerm,
      status: dto.status,
      note: dto.note,
    });

    return educationEnrollmentsRepository.findOne({
      where: {
        id: enrollment.id,
      },
    });
  }

  async updateEducationEnrollment(
    educationId: number,
    educationTermId: number,
    educationEnrollmentId: number,
    dto: UpdateEducationEnrollmentDto,
    qr: QueryRunner,
  ) {
    const educationEnrollmentsRepository =
      this.getEducationEnrollmentsRepository(qr);

    const targetEducationEnrollment = await this.getEducationEnrollmentById(
      educationTermId,
      educationEnrollmentId,
      qr,
    );

    // 교육 이수 상태 변경 시 해당 기수의 이수자 통계 업데이트
    if (dto.status) {
      // 기존 statusCount 감소
      // 기존 status 가 존재하고 새 status 가 다른 요청일 경우에만
      if (
        targetEducationEnrollment.status &&
        targetEducationEnrollment.status !== dto.status
      ) {
        await this.decrementEducationStatusCount(
          educationTermId,
          targetEducationEnrollment.status,
          qr,
        );
      }

      // 새 statusCount 증가
      // 기존 status 와 새 status 가 다를 때만
      if (dto.status !== targetEducationEnrollment.status) {
        await this.incrementEducationStatusCount(
          educationTermId,
          dto.status,
          qr,
        );
      }
    }

    // 교육등록 업데이트
    await educationEnrollmentsRepository.update(
      {
        id: educationEnrollmentId,
        educationTermId,
      },
      {
        status: dto.status,
        note: dto.isDeleteNote ? null : dto.note,
      },
    );

    return educationEnrollmentsRepository.findOne({
      where: { id: educationEnrollmentId },
    });
  }

  /**
   * 교육 등록 삭제
   * 기수의 enrollmentCount, inProgressCount, completedCount, incompleteCount 수정
   * 하위의 출석 데이터 삭제
   * @param educationId
   * @param educationTermId
   * @param educationEnrollmentId
   * @param qr
   */
  async deleteEducationEnrollment(
    educationId: number,
    educationTermId: number,
    educationEnrollmentId: number,
    qr: QueryRunner,
  ) {
    const educationEnrollmentsRepository =
      this.getEducationEnrollmentsRepository(qr);

    const targetEnrollment = await this.getEducationEnrollmentById(
      educationTermId,
      educationEnrollmentId,
      qr,
    );

    const { status } = targetEnrollment;

    // decrementEnrollmentCount
    await this.decrementEnrollmentCount(educationTermId, qr);
    // decrementStatusCount
    await this.decrementEducationStatusCount(educationTermId, status, qr);

    await educationEnrollmentsRepository.softDelete({
      id: educationEnrollmentId,
      educationTermId,
    });

    // 해당 교육 등록과 관련된 출석 정보 삭제
    const sessionAttendanceRepository = this.getSessionAttendanceRepository(qr);
    await sessionAttendanceRepository.softDelete({
      educationEnrollmentId: educationEnrollmentId,
    });

    return `educationEnrollment: ${educationEnrollmentId} deleted`;
  }

  async incrementEnrollmentCount(educationTermId: number, qr: QueryRunner) {
    const educationTermsRepository = this.getEducationTermsRepository(qr);

    const result = await educationTermsRepository.increment(
      { id: educationTermId },
      'enrollmentCount',
      1,
    );

    if (result.affected === 0) {
      throw new NotFoundException('해당 교육 기수를 찾을 수 없습니다.');
    }

    return result;
  }

  async decrementEnrollmentCount(educationTermId: number, qr: QueryRunner) {
    const educationTermsRepository = this.getEducationTermsRepository(qr);

    const result = await educationTermsRepository.decrement(
      { id: educationTermId },
      'enrollmentCount',
      1,
    );

    if (result.affected === 0) {
      throw new NotFoundException('해당 교육 기수를 찾을 수 없습니다.');
    }

    return result;
  }

  async incrementEducationStatusCount(
    educationTermId: number,
    status: EducationStatus,
    qr: QueryRunner,
  ) {
    const educationTermsRepository = this.getEducationTermsRepository(qr);

    const result = await educationTermsRepository.increment(
      {
        id: educationTermId,
      },
      this.CountColumnMap[status],
      1,
    );

    if (result.affected === 0) {
      throw new NotFoundException('해당 교육 기수를 찾을 수 없습니다.');
    }

    return result;
  }

  async decrementEducationStatusCount(
    educationTermId: number,
    status: EducationStatus,
    qr: QueryRunner,
  ) {
    const educationTermsRepository = this.getEducationTermsRepository(qr);

    const result = await educationTermsRepository.decrement(
      {
        id: educationTermId,
      },
      this.CountColumnMap[status],
      1,
    );

    if (result.affected === 0) {
      throw new NotFoundException('해당 교육 기수를 찾을 수 없습니다.');
    }

    return result;
  }

  private getSessionAttendanceRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(SessionAttendanceModel)
      : this.sessionAttendanceRepository;
  }

  async getSessionAttendance(educationSessionId: number) {
    const sessionAttendanceRepository = this.getSessionAttendanceRepository();

    const sessionAttendance = await sessionAttendanceRepository.find({
      where: {
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
    });

    /*sessionAttendance.forEach((attendance) => {
      attendance.educationEnrollment.member.groupHistory =
        attendance.educationEnrollment.member.groupHistory.filter(
          (group) => group.endDate === null,
        );
    });*/

    return sessionAttendance;
  }

  async getSessionAttendanceModelById(
    sessionAttendanceId: number,
    qr?: QueryRunner,
  ) {
    const sessionAttendanceRepository = this.getSessionAttendanceRepository(qr);

    const sessionAttendance = await sessionAttendanceRepository.findOne({
      where: { id: sessionAttendanceId },
    });

    if (!sessionAttendance) {
      throw new NotFoundException('해당 세션 출석 정보를 찾을 수 없습니다.');
    }

    return sessionAttendance;
  }

  async createSessionAttendance(
    educationTermId: number,
    educationSessionId: number,
    qr: QueryRunner,
  ) {
    const educationEnrollmentsRepository =
      this.getEducationEnrollmentsRepository(qr);

    // 수강 등록생 조회
    const educationEnrollments = await educationEnrollmentsRepository.find({
      where: {
        educationTermId,
      },
    });

    const sessionAttendanceRepository = this.getSessionAttendanceRepository(qr);

    // 해당 세션에 이미 만들어진 출석부 조회
    const existingAttendances = await sessionAttendanceRepository.find({
      where: {
        educationSessionId,
        educationEnrollmentId: In(
          educationEnrollments.map((enrollment) => enrollment.id),
        ),
      },
    });

    const existingIds = new Set(
      existingAttendances.map((attendance) => attendance.educationEnrollmentId),
    );

    // 이미 만들어진 출석부는 제외하고 생성
    await sessionAttendanceRepository.save(
      educationEnrollments
        .filter((enrollment) => !existingIds.has(enrollment.id))
        .map((enrollment) => ({
          educationSessionId,
          educationEnrollment: enrollment,
        })),
    );

    const result = await sessionAttendanceRepository.find({
      where: {
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
    });

    return result;
  }

  async updateSessionAttendance(
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

    const sessionAttendance =
      await this.getSessionAttendanceModelById(sessionAttendanceId);

    // sessionAttendance 업데이트
    await sessionAttendanceRepository.update(
      {
        id: sessionAttendanceId,
      },
      {
        isPresent: dto.isPresent,
        note: dto.isDeleteNote ? null : dto.note,
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

    const educationTermsRepository = this.getEducationTermsRepository(qr);

    const enrollment = await this.getEducationEnrollmentModelById(
      sessionAttendance.educationEnrollmentId,
      qr,
    );

    const educationTerm = await educationTermsRepository.findOne({
      where: {
        id: enrollment.educationTermId,
      },
    });

    if (!educationTerm) {
      throw new NotFoundException('해당 교육 기수를 찾을 수 없습니다.');
    }

    const attendanceCount = await sessionAttendanceRepository.count({
      where: {
        educationEnrollmentId: sessionAttendance.educationEnrollmentId,
        isPresent: true,
      },
    });

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
