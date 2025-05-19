import { IEducationSessionDomainService } from '../interface/education-session-domain.service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { EducationSessionModel } from '../../../entity/education-session.entity';
import {
  FindOptionsOrder,
  FindOptionsRelations,
  MoreThan,
  QueryRunner,
  Repository,
} from 'typeorm';
import { EducationTermModel } from '../../../entity/education-term.entity';
import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { EducationSessionException } from '../../../const/exception/education.exception';
import { UpdateEducationSessionDto } from '../../../dto/sessions/request/update-education-session.dto';
import { session } from 'passport';
import { CreateEducationSessionDto } from '../../../dto/sessions/request/create-education-session.dto';
import { MemberModel } from '../../../../../members/entity/member.entity';
import { MemberException } from '../../../../../members/const/exception/member.exception';
import { UserRole } from '../../../../../user/const/user-role.enum';
import {
  MemberSummarizedRelation,
  MemberSummarizedSelect,
} from '../../../../../members/const/member-find-options.const';
import { GetEducationSessionDto } from '../../../dto/sessions/request/get-education-session.dto';
import { EducationSessionDomainPaginationResultDto } from '../dto/sessions/education-session-domain-pagination-result.dto';
import { EducationSessionOrderEnum } from '../../../const/order.enum';

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

  async findEducationSessions(
    educationTerm: EducationTermModel,
    dto: GetEducationSessionDto,
    qr?: QueryRunner,
  ) {
    const educationSessionsRepository = this.getEducationSessionsRepository(qr);

    const order: FindOptionsOrder<EducationSessionModel> = {
      [dto.order]: dto.orderDirection,
    };

    if (dto.order !== EducationSessionOrderEnum.createdAt) {
      order.createdAt = 'asc';
    }

    const [data, totalCount] = await Promise.all([
      educationSessionsRepository.find({
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
          name: true,
          inChargeId: true,
          inCharge: MemberSummarizedSelect,
          startDate: true,
          endDate: true,
          status: true,
          //isDone: true,
          //sessionDate: true,
        },
        order,
        take: dto.take,
        skip: dto.take * (dto.page - 1),
      }),
      educationSessionsRepository.count({
        where: {
          educationTermId: educationTerm.id,
        },
      }),
    ]);

    return new EducationSessionDomainPaginationResultDto(data, totalCount);
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
      },
      select: {
        inCharge: MemberSummarizedSelect,
        creator: MemberSummarizedSelect,
      },
    });

    if (!session) {
      throw new NotFoundException(EducationSessionException.NOT_FOUND);
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

  private assertValidInCharge(inCharge: MemberModel) {
    if (!inCharge.userId) {
      throw new UnauthorizedException(
        EducationSessionException.UNLINKED_IN_CHARGE,
      );
    }

    // 담당자 조회 시 user 정보 join X
    if (!inCharge.user) {
      throw new InternalServerErrorException(MemberException.USER_ERROR);
    }

    if (
      inCharge.user.role !== UserRole.mainAdmin &&
      inCharge.user.role !== UserRole.manager
    ) {
      throw new ConflictException(
        EducationSessionException.INVALID_IN_CHARGE_ROLE,
      );
    }
  }

  async createSingleEducationSession(
    educationTerm: EducationTermModel,
    creatorMember: MemberModel,
    dto: CreateEducationSessionDto,
    inCharge: MemberModel | null,
    qr: QueryRunner,
  ) {
    const educationSessionsRepository = this.getEducationSessionsRepository(qr);

    if (!educationTerm.canAddSession()) {
      throw new ConflictException(
        EducationSessionException.EXCEED_MAX_SESSION_NUMBER,
      );
    }

    const lastSession = await educationSessionsRepository.findOne({
      where: {
        educationTermId: educationTerm.id,
      },
      order: {
        session: 'desc',
      },
    });

    const newSessionNumber = lastSession ? lastSession.session + 1 : 1;

    inCharge && this.assertValidInCharge(inCharge);

    return educationSessionsRepository.save({
      creatorId: creatorMember.id,
      educationTermId: educationTerm.id,
      session: newSessionNumber,
      name: dto.name,
      startDate: dto.startDate,
      endDate: dto.endDate,
      inChargeId: inCharge ? inCharge.id : undefined,
      content: dto.content,
      status: dto.status,
    });
  }

  private assertValidateSessionDate(
    educationSession: EducationSessionModel,
    dto: UpdateEducationSessionDto,
  ) {
    // 시작 날짜 수정
    if (dto.startDate && !dto.endDate) {
      if (dto.startDate > educationSession.endDate) {
        throw new BadRequestException(
          EducationSessionException.INVALID_START_DATE,
        );
      }
    } else if (dto.endDate && !dto.startDate) {
      if (dto.endDate < educationSession.startDate) {
        throw new BadRequestException(
          EducationSessionException.INVALID_END_DATE,
        );
      }
    }
  }

  async updateEducationSession(
    educationSession: EducationSessionModel,
    dto: UpdateEducationSessionDto,
    inCharge: MemberModel | null,
    qr: QueryRunner,
  ) {
    const educationSessionsRepository = this.getEducationSessionsRepository(qr);

    this.assertValidateSessionDate(educationSession, dto);
    inCharge && this.assertValidInCharge(inCharge);

    const inChargeId =
      dto.inChargeId === undefined ? undefined : dto.inChargeId;

    const result = await educationSessionsRepository.update(
      {
        id: educationSession.id,
      },
      {
        ...dto,
        inChargeId,
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
}
