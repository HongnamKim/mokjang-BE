import { IEducationSessionDomainService } from '../interface/education-session-domain.service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { EducationSessionModel } from '../../../../entity/education/education-session.entity';
import { MoreThan, QueryRunner, Repository } from 'typeorm';
import { EducationTermModel } from '../../../../entity/education/education-term.entity';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { EducationSessionException } from '../../../const/exception/education.exception';
import { UpdateEducationSessionDto } from '../../../dto/sessions/update-education-session.dto';
import { session } from 'passport';

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

  async createSingleEducationSession(
    educationTerm: EducationTermModel,
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
      session: newSessionNumber,
      educationTerm,
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

  async deleteEducationSessionCasCade(
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
