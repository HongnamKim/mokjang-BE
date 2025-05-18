import { IEducationSessionDomainService } from '../interface/education-session-domain.service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { EducationSessionModel } from '../../../entity/education-session.entity';
import { MoreThan, QueryRunner, Repository } from 'typeorm';
import { EducationTermModel } from '../../../entity/education-term.entity';
import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { EducationSessionException } from '../../../const/exception/education.exception';
import { UpdateEducationSessionDto } from '../../../dto/sessions/update-education-session.dto';
import { session } from 'passport';
import { CreateEducationSessionDto } from '../../../dto/sessions/request/create-education-session.dto';
import { MemberModel } from '../../../../../members/entity/member.entity';
import { MemberException } from '../../../../../members/const/exception/member.exception';
import { UserRole } from '../../../../../user/const/user-role.enum';
import {
  MemberSummarizedRelation,
  MemberSummarizedSelect,
} from '../../../../../members/const/member-find-options.const';

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
    qr?: QueryRunner,
  ) {
    const educationSessionsRepository = this.getEducationSessionsRepository(qr);

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
        name: true,
        inChargeId: true,
        inCharge: MemberSummarizedSelect,
        startDate: true,
        endDate: true,
        status: true,
        //isDone: true,
        //sessionDate: true,
      },
      order: {
        session: 'asc',
      },
    });
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
      throw new ConflictException(EducationSessionException.UNLINKED_IN_CHARGE);
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

  async updateEducationSession(
    educationSession: EducationSessionModel,
    dto: UpdateEducationSessionDto,
    qr: QueryRunner,
  ) {
    if (dto.isDone !== undefined && dto.isDone !== educationSession.isDone) {
      if (dto.isDone) {
        // EducationTerm 의 doneCount 증가
      } else {
        // EducationTerm 의 doneCount 감소
      }
    }

    const educationSessionsRepository = this.getEducationSessionsRepository(qr);

    const result = await educationSessionsRepository.update(
      {
        id: educationSession.id,
      },
      {
        content: dto.content,
        sessionDate: dto.sessionDate,
        isDone: dto.isDone,
      },
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(
        EducationSessionException.UPDATE_ERROR,
      );
    }

    const updatedSession = await educationSessionsRepository.findOne({
      where: {
        id: educationSession.id,
      },
    });

    if (!updatedSession) {
      throw new InternalServerErrorException(
        EducationSessionException.UPDATE_ERROR,
      );
    }

    return updatedSession;
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

    return `educationSessionId: ${educationSession.id} deleted`;
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
