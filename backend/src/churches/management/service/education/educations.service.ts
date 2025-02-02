import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  FindOptionsRelations,
  In,
  MoreThan,
  QueryRunner,
  Repository,
} from 'typeorm';
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
import { GetAttendanceDto } from '../../dto/education/attendance/get-attendance.dto';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { MemberDeletedEvent } from '../../../members/events/member.event';

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
    private readonly eventEmitter: EventEmitter2,
    private readonly dataSource: DataSource,
  ) {}

  @OnEvent('member.deleted', {})
  async handleMemberDeleted(event: MemberDeletedEvent) {
    const { churchId, memberId, attempt, maxAttempts } = event;

    const qr = this.dataSource.createQueryRunner();
    await qr.connect();

    await qr.startTransaction();

    try {
      const educationEnrollmentsRepository =
        this.getEducationEnrollmentsRepository(qr);

      const enrollments = await educationEnrollmentsRepository.find({
        where: {
          memberId,
          educationTerm: {
            education: {
              churchId,
            },
          },
        },
        relations: {
          educationTerm: true,
        },
      });

      await Promise.all(
        enrollments.map((enrollment) =>
          this.deleteEducationEnrollment(
            churchId,
            enrollment.educationTerm.educationId,
            enrollment.educationTermId,
            enrollment.id,
            qr,
          ),
        ),
      );

      console.log(
        `Successfully processed member deletion for churchId: ${churchId}, memberId: ${memberId}`,
      );

      await qr.commitTransaction();
      await qr.release();
    } catch (error) {
      await qr.rollbackTransaction();
      await qr.release();

      console.error(
        `Failed to process member deletion. churchId: ${churchId}, memberId: ${memberId}, attempt: ${attempt}`,
        error.stack,
      );

      if (attempt < maxAttempts) {
        console.log(`Retrying... Attempt ${attempt + 1} of ${maxAttempts}`);

        // 일정 시간 후 재시도
        setTimeout(() => {
          this.eventEmitter.emit(
            'member.deleted',
            new MemberDeletedEvent(
              churchId,
              memberId,
              attempt + 1,
              maxAttempts,
            ),
          );
        }, this.getRetryDelay(attempt));
      } else {
        // 최대 시도 횟수 초과
        console.error(
          `Max retry attempts reached for member deletion. churchId: ${churchId}, memberId: ${memberId}`,
        );

        // 실패 처리 이벤트 발행
        /*this.eventEmitter.emit('member.deletion.failed', {
          churchId,
          memberId,
          error: error.message,
        });*/
      }
    }
  }

  // 재시도 간격을 지수적으로 증가 (exponential backoff)
  private getRetryDelay(attempt: number): number {
    return Math.min(1000 * Math.pow(2, attempt), 10000); // 최대 10초
  }

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

  private getEducationSessionsRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(EducationSessionModel)
      : this.educationSessionsRepository;
  }

  async getEducationSessions(
    churchId: number,
    educationId: number,
    educationTermId: number,
  ) {
    const educationSessionsRepository = this.getEducationSessionsRepository();

    return educationSessionsRepository.find({
      where: {
        educationTerm: {
          educationId,
          education: {
            churchId,
          },
        },
        educationTermId,
      },
      order: {
        session: 'asc',
      },
    });
  }

  async getEducationSessionById(
    churchId: number,
    educationId: number,
    educationTermId: number,
    educationSessionId: number,
    qr?: QueryRunner,
  ) {
    const educationSessionsRepository = this.getEducationSessionsRepository(qr);

    const session = await educationSessionsRepository.findOne({
      where: {
        id: educationSessionId,
        educationTermId,
        educationTerm: {
          educationId,
          education: {
            churchId,
          },
        },
      },
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
    churchId: number,
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
      relations: {
        educationEnrollments: true,
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

    await Promise.all([
      // 교육 세션 개수 업데이트
      educationTermsRepository.increment(
        { id: educationTermId },
        'numberOfSessions',
        1,
      ),
      // 세션 출석 정보 생성
      this.getSessionAttendanceRepository(qr).save(
        educationTerm.educationEnrollments.map((enrollment) => ({
          educationSessionId: newSession.id,
          educationEnrollmentId: enrollment.id,
        })),
      ),
    ]);

    return this.getEducationSessionById(
      churchId,
      educationId,
      educationTermId,
      newSession.id,
      qr,
    );
  }

  async updateEducationSession(
    churchId: number,
    educationId: number,
    educationTermId: number,
    educationSessionId: number,
    dto: UpdateEducationSessionDto,
    qr: QueryRunner,
  ) {
    const educationSessionsRepository = this.getEducationSessionsRepository(qr);

    const targetSession = await this.getEducationSessionById(
      churchId,
      educationId,
      educationTermId,
      educationSessionId,
      qr,
    );

    /*
    기존 session 의 isDone 이 true
    --> dto.isDone = true -> isDoneCount 변화 X
    --> dto.isDone = false -> isDoneCount 감소
    */
    if (dto.isDone !== undefined && dto.isDone !== targetSession.isDone) {
      if (dto.isDone) {
        console.log('isDoneCount 증가');
        await this.incrementIsDoneCount(educationTermId, qr);
      } else if (!dto.isDone) {
        console.log('isDoneCount 감소');
        await this.decrementIsDoneCount(educationTermId, qr);
      }
    }

    /*
    기존 session 의 isDone 이 false
    --> dto.isDone = true -> isDoneCount 증가
    --> dto.isDone = false --> isDoneCount 변화 X
     */

    const result = await educationSessionsRepository.update(
      {
        id: targetSession.id,
      },
      {
        content: dto.content,
        sessionDate: dto.sessionDate,
        isDone: dto.isDone,
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
    churchId: number,
    educationId: number,
    educationTermId: number,
    educationSessionId: number,
    qr: QueryRunner,
  ) {
    const educationSessionsRepository = this.getEducationSessionsRepository(qr);

    const targetSession = await this.getEducationSessionById(
      churchId,
      educationId,
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
    await educationSessionsRepository.decrement(
      { educationTermId, session: MoreThan(targetSession.session) },
      'session',
      1,
    );

    // 해당 기수의 세션 개수 업데이트
    await educationTermsRepository.decrement(
      { id: educationTermId },
      'numberOfSessions',
      1,
    );

    if (targetSession.isDone) {
      await this.decrementIsDoneCount(educationTermId, qr);
    }

    // 해당 세션 하위의 출석 정보 삭제
    const sessionAttendanceRepository = this.getSessionAttendanceRepository(qr);

    const attendances = await sessionAttendanceRepository.find({
      where: {
        educationSessionId,
      },
    });

    // 삭제할 세션에 출석한 교육 대상자 ID
    const attendedEnrollmentIds = attendances
      .filter((attendance) => attendance.isPresent)
      .map((attendance) => attendance.educationEnrollmentId);

    // 해당 세션의 출석 정보 삭제
    await sessionAttendanceRepository.softDelete({
      educationSessionId: educationSessionId,
    });

    const educationEnrollmentsRepository =
      this.getEducationEnrollmentsRepository(qr);

    await educationEnrollmentsRepository.decrement(
      { id: In(attendedEnrollmentIds) },
      'attendanceCount',
      1,
    );

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

    const [result, totalCount] = await Promise.all([
      educationEnrollmentsRepository.find({
        where: {
          educationTermId,
          educationTerm: {
            educationId,
            education: {
              churchId,
            },
          },
        },
        relations: {
          member: {
            group: true,
            groupRole: true,
            officer: true,
          },
        },
        order: {
          [dto.order]: dto.orderDirection,
          createdAt:
            dto.order === EducationEnrollmentOrderEnum.createdAt
              ? undefined
              : 'desc',
        },
        take: dto.take,
        skip: dto.take * (dto.page - 1),
      }),
      educationEnrollmentsRepository.count({
        where: {
          educationTermId,
          educationTerm: {
            educationId,
            education: {
              churchId,
            },
          },
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
    churchId: number,
    educationId: number,
    educationTermId: number,
    educationEnrollmentId: number,
    qr?: QueryRunner,
  ) {
    const educationEnrollmentsRepository =
      this.getEducationEnrollmentsRepository(qr);

    const enrollment = await educationEnrollmentsRepository.findOne({
      where: {
        educationTerm: {
          educationId,
          education: {
            churchId,
          },
        },
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

    const member = await this.membersService.getMemberModelById(
      churchId,
      dto.memberId,
      {},
      qr,
    );

    const [educationTerm, isExistEnrollment] = await Promise.all([
      this.getEducationTermModelById(
        churchId,
        educationId,
        educationTermId,
        qr,
      ),
      this.isExistEnrollment(educationTermId, member.id, qr),
    ]);

    if (isExistEnrollment) {
      throw new BadRequestException('이미 교육 대상자로 등록된 교인입니다.');
    }

    // enrollment 생성
    const enrollment = await educationEnrollmentsRepository.save({
      member,
      educationTerm,
      status: dto.status,
      note: dto.note,
    });

    // 교육 등록 생성 후속 작업
    const educationSessionIds = educationTerm.educationSessions.map(
      (session) => session.id,
    );

    const sessionAttendanceRepository = this.getSessionAttendanceRepository(qr);

    // 수강 대상 교인 수 증가 + 세션의 출석 정보 생성
    await Promise.all([
      this.incrementEnrollmentCount(educationTermId, qr),
      this.incrementEducationStatusCount(educationTermId, dto.status, qr),
      sessionAttendanceRepository.save(
        educationSessionIds.map((sessionSessionId) => {
          return {
            educationSessionId: sessionSessionId,
            educationEnrollmentId: enrollment.id,
          };
        }),
      ),
    ]);

    return educationEnrollmentsRepository.findOne({
      where: {
        id: enrollment.id,
      },
      relations: {
        member: {
          group: true,
          groupRole: true,
          officer: true,
        },
      },
    });
  }

  async updateEducationEnrollment(
    churchId: number,
    educationId: number,
    educationTermId: number,
    educationEnrollmentId: number,
    dto: UpdateEducationEnrollmentDto,
    qr: QueryRunner,
  ) {
    const educationEnrollmentsRepository =
      this.getEducationEnrollmentsRepository(qr);

    const targetEducationEnrollment = await this.getEducationEnrollmentById(
      churchId,
      educationId,
      educationTermId,
      educationEnrollmentId,
      qr,
    );

    // 교육 이수 상태 변경 시 해당 기수의 이수자 통계 업데이트
    // 교육 이수 상태를 변경 && 기존 이수 상태와 다를 경우
    if (dto.status && dto.status !== targetEducationEnrollment.status) {
      await Promise.all([
        // 기존 status 감소
        this.decrementEducationStatusCount(
          educationTermId,
          targetEducationEnrollment.status,
          qr,
        ),
        // 새 status 증가
        this.incrementEducationStatusCount(educationTermId, dto.status, qr),
      ]);
    }

    // 교육등록 업데이트
    await educationEnrollmentsRepository.update(
      {
        id: educationEnrollmentId,
        educationTermId,
      },
      {
        status: dto.status,
        note: dto.note,
      },
    );

    return educationEnrollmentsRepository.findOne({
      where: {
        id: targetEducationEnrollment.id,
      },
      relations: {
        member: {
          group: true,
          groupRole: true,
          officer: true,
        },
      },
    });
  }

  async deleteEducationEnrollment(
    churchId: number,
    educationId: number,
    educationTermId: number,
    educationEnrollmentId: number,
    qr: QueryRunner,
  ) {
    const educationEnrollmentsRepository =
      this.getEducationEnrollmentsRepository(qr);

    const targetEnrollment = await this.getEducationEnrollmentById(
      churchId,
      educationId,
      educationTermId,
      educationEnrollmentId,
      qr,
    );

    await Promise.all([
      // 등록 인원 감소
      this.decrementEnrollmentCount(educationTermId, qr),
      // 상태별 카운트 감소
      this.decrementEducationStatusCount(
        educationTermId,
        targetEnrollment.status,
        qr,
      ),
      // 교육 등록 삭제
      educationEnrollmentsRepository.softDelete({
        id: educationEnrollmentId,
        educationTermId,
      }),
      // 출석 정보 삭제
      this.getSessionAttendanceRepository(qr).softDelete({
        educationEnrollmentId,
      }),
    ]);

    return `educationEnrollment: ${educationEnrollmentId} deleted`;
  }

  async incrementIsDoneCount(educationTermId: number, qr: QueryRunner) {
    const educationTermsRepository = this.getEducationTermsRepository(qr);

    const result = await educationTermsRepository.increment(
      { id: educationTermId },
      'isDoneCount',
      1,
    );

    if (result.affected === 0) {
      throw new NotFoundException('해당 교육 기수를 찾을 수 없습니다.');
    }

    return result;
  }

  async decrementIsDoneCount(educationTermId: number, qr: QueryRunner) {
    const educationTermsRepository = this.getEducationTermsRepository(qr);

    const result = await educationTermsRepository.decrement(
      { id: educationTermId },
      'isDoneCount',
      1,
    );

    if (result.affected === 0) {
      throw new NotFoundException('해당 교육 기수를 찾을 수 없습니다.');
    }

    return result;
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
      this.getEducationEnrollmentModelById(
        sessionAttendance.educationEnrollmentId,
        qr,
      ),
      sessionAttendanceRepository.count({
        where: {
          educationEnrollmentId: sessionAttendance.educationEnrollmentId,
          isPresent: true,
        },
      }),
    ]);

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
