import { IEducationSessionDomainService } from '../interface/education-session-domain.service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { EducationSessionModel } from '../../education-session/entity/education-session.entity';
import {
  Between,
  FindOptionsOrder,
  FindOptionsRelations,
  LessThanOrEqual,
  MoreThan,
  MoreThanOrEqual,
  QueryRunner,
  Repository,
  UpdateResult,
} from 'typeorm';
import { EducationTermModel } from '../../education-term/entity/education-term.entity';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UpdateEducationSessionDto } from '../../education-session/dto/request/update-education-session.dto';
import { CreateEducationSessionDto } from '../../education-session/dto/request/create-education-session.dto';
import { GetEducationSessionDto } from '../../education-session/dto/request/get-education-session.dto';
import { EducationSessionOrder } from '../../education-session/const/education-session-order.enum';
import { ChurchModel } from '../../../churches/entity/church.entity';
import { GetEducationSessionForCalendarDto } from '../../../calendar/dto/request/education/get-education-session-for-calendar.dto';
import {
  MemberSummarizedRelation,
  MemberSummarizedSelect,
} from '../../../members/const/member-find-options.const';
import { ChurchUserModel } from '../../../church-user/entity/church-user.entity';
import { MemberModel } from '../../../members/entity/member.entity';
import { EducationSessionException } from '../../education-session/exception/education-session.exception';
import { MyScheduleStatusCountDto } from '../../../task/dto/my-schedule-status-count.dto';
import { session } from 'passport';
import { EducationSessionStatus } from '../../education-session/const/education-session-status.enum';
import { ScheduleStatusOption } from '../../../home/const/schedule-status-option.enum';

export class EducationSessionDomainService
  implements IEducationSessionDomainService
{
  constructor(
    @InjectRepository(EducationSessionModel)
    private readonly educationSessionsRepository: Repository<EducationSessionModel>,
  ) {}

  private getEducationSessionsRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(EducationSessionModel)
      : this.educationSessionsRepository;
  }

  async findEducationSessionsForCalendar(
    church: ChurchModel,
    dto: GetEducationSessionForCalendarDto,
    qr?: QueryRunner,
  ): Promise<EducationSessionModel[]> {
    const repository = this.getEducationSessionsRepository(qr);

    return repository.find({
      where: {
        educationTerm: {
          education: {
            churchId: church.id,
          },
        },
        startDate: Between(dto.fromDate, dto.toDate),
      },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        session: true,
        title: true,
        startDate: true,
        endDate: true,
        status: true,
        inCharge: MemberSummarizedSelect,
        educationTerm: {
          id: true,
          createdAt: true,
          updatedAt: true,
          term: true,
          status: true,
          startDate: true,
          endDate: true,
          education: {
            id: true,
            createdAt: true,
            updatedAt: true,
            name: true,
          },
        },
      },
      relations: {
        inCharge: MemberSummarizedRelation,
        educationTerm: {
          education: true,
        },
      },
      order: {
        startDate: 'asc',
      },
    });
  }

  async findEducationSessionByIdForCalendar(
    church: ChurchModel,
    sessionId: number,
    qr?: QueryRunner,
  ): Promise<EducationSessionModel> {
    const repository = this.getEducationSessionsRepository(qr);

    const educationSession = await repository.findOne({
      where: {
        id: sessionId,
        educationTerm: {
          education: {
            churchId: church.id,
          },
        },
      },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        session: true,
        title: true,
        startDate: true,
        endDate: true,
        status: true,
        inCharge: MemberSummarizedSelect,
        educationTerm: {
          id: true,
          createdAt: true,
          updatedAt: true,
          term: true,
          status: true,
          startDate: true,
          endDate: true,
          education: {
            id: true,
            createdAt: true,
            updatedAt: true,
            name: true,
          },
        },
      },
      relations: {
        inCharge: MemberSummarizedRelation,
        educationTerm: {
          education: true,
        },
      },
    });

    if (!educationSession) {
      throw new NotFoundException(EducationSessionException.NOT_FOUND);
    }

    return educationSession;
  }

  findEducationSessionIds(
    educationTerm: EducationTermModel,
    qr: QueryRunner,
  ): Promise<EducationSessionModel[]> {
    const repository = this.getEducationSessionsRepository(qr);

    return repository.find({
      where: {
        educationTermId: educationTerm.id,
      },
      select: { id: true },
      order: {
        session: 'ASC',
      },
    });
  }

  async findEducationSessions(
    educationTerm: EducationTermModel,
    dto: GetEducationSessionDto,
    qr?: QueryRunner,
  ) {
    const educationSessionsRepository = this.getEducationSessionsRepository(qr);

    const order: FindOptionsOrder<EducationSessionModel> = {
      [dto.order]: dto.orderDirection,
    };

    if (dto.order !== EducationSessionOrder.CREATED_AT) {
      order.createdAt = 'asc';
    }

    return educationSessionsRepository.find({
      where: {
        educationTermId: educationTerm.id,
      },
      relations: {
        inCharge: MemberSummarizedRelation,
      },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        educationTermId: true,
        session: true,
        title: true,
        inChargeId: true,
        inCharge: MemberSummarizedSelect,
        startDate: true,
        endDate: true,
        status: true,
      },
      order,
      take: dto.take,
      skip: dto.take * (dto.page - 1),
    });
  }

  async findEducationSessionModelById(
    educationTerm: EducationTermModel,
    educationSessionId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<EducationSessionModel>,
  ) {
    const repository = this.getEducationSessionsRepository(qr);

    const session = await repository.findOne({
      where: {
        educationTermId: educationTerm.id,
        id: educationSessionId,
      },
      relations: relationOptions,
    });

    if (!session) {
      throw new NotFoundException(EducationSessionException.NOT_FOUND);
    }

    return session;
  }

  async findEducationSessionById(
    educationTerm: EducationTermModel,
    educationSessionId: number,
    qr?: QueryRunner,
  ) {
    const educationSessionsRepository = this.getEducationSessionsRepository(qr);

    const session = await educationSessionsRepository.findOne({
      where: {
        educationTermId: educationTerm.id,
        id: educationSessionId,
      },
      relations: {
        inCharge: MemberSummarizedRelation,
        creator: MemberSummarizedRelation,
        reports: {
          receiver: MemberSummarizedRelation,
        },
      },
      select: {
        inCharge: MemberSummarizedSelect,
        creator: MemberSummarizedSelect,
        reports: {
          id: true,
          isRead: true,
          isConfirmed: true,
          receiver: MemberSummarizedSelect,
          reportedAt: true,
        },
      },
    });

    if (!session) {
      throw new NotFoundException(EducationSessionException.NOT_FOUND);
    }

    // 보고 정렬
    if (session?.reports) {
      session.reports.sort(
        (a, b) =>
          new Date(a.reportedAt).getTime() - new Date(b.reportedAt).getTime(),
      );
    }

    return session;
  }

  createEducationSessions(
    educationTerm: EducationTermModel,
    numberOfSession: number,
    qr: QueryRunner,
  ): Promise<EducationSessionModel[]> {
    const educationSessionsRepository = this.getEducationSessionsRepository(qr);

    return educationSessionsRepository.save(
      Array.from({ length: numberOfSession }, (_, i) => ({
        session: i + 1,
        educationTerm,
      })),
    );
  }

  createAdditionalSessions(
    educationTerm: EducationTermModel,
    numberOfSessions: number,
    qr: QueryRunner,
  ): Promise<EducationSessionModel[]> {
    const educationSessionsRepository = this.getEducationSessionsRepository(qr);

    return educationSessionsRepository.save(
      Array.from(
        {
          length: numberOfSessions - educationTerm.educationSessions.length,
        },
        (_, index) => ({
          educationTerm,
          session: educationTerm.educationSessions.length + index + 1,
        }),
      ),
    );
  }

  async createEducationSession(
    educationTerm: EducationTermModel,
    creatorManager: ChurchUserModel,
    dto: CreateEducationSessionDto,
    inCharge: ChurchUserModel | null,
    qr: QueryRunner,
  ) {
    const educationSessionsRepository = this.getEducationSessionsRepository(qr);

    const lastSession = await educationSessionsRepository.findOne({
      where: {
        educationTermId: educationTerm.id,
      },
      order: {
        session: 'desc',
      },
    });

    const newSessionNumber = lastSession ? lastSession.session + 1 : 1;

    return educationSessionsRepository.save({
      creatorId: creatorManager.member.id,
      educationTermId: educationTerm.id,
      session: newSessionNumber,
      title: dto.title,
      startDate: dto.utcStartDate,
      endDate: dto.utcEndDate,
      inChargeId: inCharge ? inCharge.member.id : undefined,
      content: dto.content,
    });
  }

  private assertValidateSessionDate(
    educationSession: EducationSessionModel,
    dto: UpdateEducationSessionDto,
  ) {
    // 시작 날짜 수정
    if (dto.utcStartDate && !dto.utcEndDate) {
      if (dto.utcStartDate > educationSession.endDate) {
        throw new BadRequestException(
          EducationSessionException.INVALID_START_DATE,
        );
      }
    } else if (dto.utcEndDate && !dto.utcStartDate) {
      if (dto.utcEndDate < educationSession.startDate) {
        throw new BadRequestException(
          EducationSessionException.INVALID_END_DATE,
        );
      }
    }
  }

  async updateEducationSession(
    educationSession: EducationSessionModel,
    dto: UpdateEducationSessionDto,
    inCharge: ChurchUserModel | null,
    qr: QueryRunner,
  ) {
    const educationSessionsRepository = this.getEducationSessionsRepository(qr);

    this.assertValidateSessionDate(educationSession, dto);

    const result = await educationSessionsRepository.update(
      {
        id: educationSession.id,
      },
      {
        title: dto.title,
        startDate: dto.utcStartDate,
        endDate: dto.utcEndDate,
        content: dto.content,
        status: dto.status,
        inChargeId: inCharge ? inCharge.member.id : undefined,
      },
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(
        EducationSessionException.UPDATE_ERROR,
      );
    }

    return result;
  }

  async deleteEducationSession(
    educationSession: EducationSessionModel,
    qr: QueryRunner,
  ) {
    const educationSessionsRepository = this.getEducationSessionsRepository(qr);

    const result = await educationSessionsRepository.softDelete({
      id: educationSession.id,
    });

    if (result.affected === 0) {
      throw new InternalServerErrorException(
        EducationSessionException.DELETE_ERROR,
      );
    }

    return;
  }

  async deleteEducationSessionCascade(
    educationTerm: EducationTermModel,
    qr: QueryRunner,
  ): Promise<string> {
    const educationSessionsRepository = this.getEducationSessionsRepository(qr);

    const result = await educationSessionsRepository.softDelete({
      educationTermId: educationTerm.id,
    });

    return `${result.affected} sessions deleted`;
  }

  async reorderSessionsAfterDeletion(
    educationTerm: EducationTermModel,
    deletedSession: EducationSessionModel,
    qr: QueryRunner,
  ) {
    const educationSessionsRepository = this.getEducationSessionsRepository(qr);

    return educationSessionsRepository.decrement(
      {
        educationTermId: educationTerm.id,
        session: MoreThan(deletedSession.session),
      },
      'session',
      1,
    );
  }

  async incrementAttendancesCount(
    educationSession: EducationSessionModel,
    count: number,
    qr: QueryRunner,
  ): Promise<UpdateResult> {
    const repository = this.getEducationSessionsRepository(qr);

    const result = await repository.increment(
      { id: educationSession.id },
      'attendancesCount',
      count,
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(
        EducationSessionException.UPDATE_ERROR,
      );
    }

    return result;
  }

  async decrementAttendancesCount(
    educationSession: EducationSessionModel,
    count: number,
    qr: QueryRunner,
  ): Promise<UpdateResult> {
    const repository = this.getEducationSessionsRepository(qr);

    const result = await repository.decrement(
      { id: educationSession.id },
      'attendancesCount',
      count,
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(
        EducationSessionException.UPDATE_ERROR,
      );
    }

    return result;
  }

  findMyEducationSessions(
    inCharge: MemberModel,
    from: Date,
    to: Date,
  ): Promise<EducationSessionModel[]> {
    const repository = this.getEducationSessionsRepository();

    return repository.find({
      where: {
        inChargeId: inCharge.id,
        startDate: LessThanOrEqual(to),
        endDate: MoreThanOrEqual(from),
      },
      order: {
        endDate: 'ASC',
      },
      relations: {
        educationTerm: true,
      },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        session: true,
        title: true,
        startDate: true,
        endDate: true,
        status: true,
        educationTerm: {
          id: true,
          educationId: true,
          educationName: true,
          term: true,
        },
      },
      take: 50,
    });
  }

  async countMyEducationSessionStatus(
    church: ChurchModel,
    me: MemberModel,
    from: Date,
    to: Date,
    option: ScheduleStatusOption,
  ): Promise<MyScheduleStatusCountDto> {
    const repository = this.getEducationSessionsRepository();

    const query = repository
      .createQueryBuilder('educationSession')
      .innerJoin('educationSession.educationTerm', 'educationTerm')
      .innerJoin(
        'educationTerm.education',
        'education',
        'education.churchId = :churchId',
        { churchId: church.id },
      )
      .where(
        'educationSession.startDate <= :to AND educationSession.endDate >= :from',
        {
          from,
          to,
        },
      )
      .select([
        'SUM(CASE WHEN educationSession.status = :reserve THEN 1 ELSE 0 END) as reserve_count',
        'SUM(CASE WHEN educationSession.status = :inProgress THEN 1 ELSE 0 END) as inprogress_count',
        'SUM(CASE WHEN educationSession.status = :done THEN 1 ELSE 0 END) as done_count',
        'SUM(CASE WHEN educationSession.status = :pending THEN 1 ELSE 0 END) as pending_count',
      ])
      .setParameters({
        reserve: EducationSessionStatus.RESERVE,
        inProgress: EducationSessionStatus.IN_PROGRESS,
        done: EducationSessionStatus.DONE,
        pending: EducationSessionStatus.PENDING,
      });

    if (option === ScheduleStatusOption.MEMBER) {
      query.andWhere('educationSession.inChargeId = :inChargeId', {
        inChargeId: me.id,
      });
    }

    const result = await query.getRawOne();

    return new MyScheduleStatusCountDto(
      parseInt(result.reserve_count) || 0,
      parseInt(result.inprogress_count) || 0,
      parseInt(result.done_count) || 0,
      parseInt(result.pending_count) || 0,
    );
  }
}
