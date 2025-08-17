import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { IWorshipSessionDomainService } from '../interface/worship-session-domain.service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { WorshipSessionModel } from '../../entity/worship-session.entity';
import {
  FindOptionsOrder,
  FindOptionsRelations,
  FindOptionsSelect,
  FindOptionsWhere,
  QueryRunner,
  Repository,
} from 'typeorm';
import { WorshipModel } from '../../entity/worship.entity';
import { CreateWorshipSessionDto } from '../../dto/request/worship-session/create-worship-session.dto';
import { WorshipSessionException } from '../../exception/worship-session.exception';
import { GetWorshipSessionsDto } from '../../dto/request/worship-session/get-worship-sessions.dto';
import { WorshipSessionOrderEnum } from '../../const/worship-session-order.enum';
import { WorshipSessionDomainPaginationResultDto } from '../dto/worship-session-domain-pagination-result.dto';
import { UpdateWorshipSessionDto } from '../../dto/request/worship-session/update-worship-session.dto';
import { ChurchUserModel } from '../../../church-user/entity/church-user.entity';
import { ManagerException } from '../../../manager/exception/manager.exception';
import { MemberException } from '../../../members/exception/member.exception';
import { ChurchUserRole } from '../../../user/const/user-role.enum';
import { TaskException } from '../../../task/const/exception-message/task.exception';
import {
  MemberSummarizedRelation,
  MemberSummarizedSelect,
} from '../../../members/const/member-find-options.const';

@Injectable()
export class WorshipSessionDomainService
  implements IWorshipSessionDomainService
{
  constructor(
    @InjectRepository(WorshipSessionModel)
    private readonly repository: Repository<WorshipSessionModel>,
  ) {}

  private getRepository(qr?: QueryRunner) {
    return qr ? qr.manager.getRepository(WorshipSessionModel) : this.repository;
  }

  async findWorshipSessions(
    worship: WorshipModel,
    dto: GetWorshipSessionsDto,
    qr?: QueryRunner,
  ) {
    const repository = this.getRepository(qr);

    const whereOptions: FindOptionsWhere<WorshipSessionModel> = {
      worshipId: worship.id,
    };

    const orderOptions: FindOptionsOrder<WorshipSessionModel> = {
      [dto.order]: dto.orderDirection,
    };

    const selectOptions: FindOptionsSelect<WorshipSessionModel> = {
      id: true,
      createdAt: true,
      updatedAt: true,
      worshipId: true,
      sessionDate: true,
    };

    if (dto.order !== WorshipSessionOrderEnum.CREATED_AT) {
      orderOptions.createdAt = 'asc';
    }

    const [data, totalCount] = await Promise.all([
      repository.find({
        where: whereOptions,
        order: orderOptions,
        select: selectOptions,
      }),

      repository.count({
        where: whereOptions,
      }),
    ]);

    return new WorshipSessionDomainPaginationResultDto(data, totalCount);
  }

  private async assertValidNewSession(
    worship: WorshipModel,
    sessionDate: Date,
    repository: Repository<WorshipSessionModel>,
  ) {
    const existSession = await repository.findOne({
      where: {
        worshipId: worship.id,
        sessionDate,
      },
    });

    if (existSession) {
      throw new ConflictException(WorshipSessionException.ALREADY_EXIST);
    }

    return true;
  }

  async findOrCreateWorshipSessionByDate(
    worship: WorshipModel,
    sessionDate: Date,
    qr: QueryRunner,
  ): Promise<
    WorshipSessionModel & {
      isCreated: boolean;
    }
  > {
    const repository = this.getRepository(qr);

    const existSession = await repository.findOne({
      where: {
        worshipId: worship.id,
        sessionDate,
      },
    });

    if (existSession) {
      return { ...existSession, isCreated: false };
    }

    const createdSession = await repository.save({
      worshipId: worship.id,
      sessionDate,
    });

    return { ...createdSession, isCreated: true };
  }

  async findOrCreateRecentWorshipSession(
    worship: WorshipModel,
    sessionDate: Date,
    qr: QueryRunner,
  ) {
    const repository = this.getRepository(qr);

    const recentWorship = await repository.findOne({
      where: {
        worshipId: worship.id,
        sessionDate: sessionDate,
      },
    });

    if (recentWorship) {
      return { ...recentWorship, isCreated: false };
    }

    const createdSession = await repository.save({
      worshipId: worship.id,
      sessionDate,
    });

    return { ...createdSession, isCreated: true };
  }

  private assertValidInChargeMember(inChargeMember: ChurchUserModel | null) {
    if (!inChargeMember) {
      return;
    }

    if (!inChargeMember.memberId) {
      throw new InternalServerErrorException(
        ManagerException.MISSING_MEMBER_DATA('예배 세션 담당자'),
      );
    }

    if (!inChargeMember.member) {
      throw new InternalServerErrorException(MemberException.LINK_ERROR);
    }

    if (
      inChargeMember.role !== ChurchUserRole.MANAGER &&
      inChargeMember.role !== ChurchUserRole.OWNER
    ) {
      throw new ConflictException(TaskException.INVALID_IN_CHARGE_MEMBER);
    }
  }

  async createWorshipSession(
    worship: WorshipModel,
    inCharge: ChurchUserModel | null,
    dto: CreateWorshipSessionDto,
    qr?: QueryRunner,
  ): Promise<WorshipSessionModel> {
    const repository = this.getRepository(qr);

    await this.assertValidNewSession(worship, dto.sessionDateUtc, repository);
    this.assertValidInChargeMember(inCharge);

    return repository.save({
      worshipId: worship.id,
      sessionDate: dto.sessionDateUtc,
      title: dto.title,
      bibleTitle: dto.title,
      description: dto.description,
      videoUrl: dto.videoUrl,
      inChargeId: inCharge ? inCharge.member.id : undefined,
    });
  }

  async findWorshipSessionById(
    worship: WorshipModel,
    sessionId: number,
    qr?: QueryRunner,
  ): Promise<WorshipSessionModel> {
    const repository = this.getRepository(qr);

    const worshipSession = await repository.findOne({
      where: {
        id: sessionId,
        worshipId: worship.id,
      },
      relations: {
        inCharge: MemberSummarizedRelation,
      },
      select: {
        inCharge: MemberSummarizedSelect,
      },
    });

    if (!worshipSession) {
      throw new NotFoundException(WorshipSessionException.NOT_FOUND);
    }

    return worshipSession;
  }

  async findWorshipSessionModelById(
    worship: WorshipModel,
    sessionId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<WorshipSessionModel>,
  ) {
    const repository = this.getRepository(qr);

    const session = await repository.findOne({
      where: {
        id: sessionId,
        worshipId: worship.id,
      },
      relations: relationOptions,
    });

    if (!session) {
      throw new NotFoundException(WorshipSessionException.NOT_FOUND);
    }

    return session;
  }

  async updateWorshipSession(
    worshipSession: WorshipSessionModel,
    inCharge: ChurchUserModel | null,
    dto: UpdateWorshipSessionDto,
    qr: QueryRunner,
  ) {
    const repository = this.getRepository(qr);

    /*dto.sessionDate &&
      (await this.assertValidNewSession(worship, dto.sessionDate, repository));*/

    this.assertValidInChargeMember(inCharge);

    const result = await repository.update(
      { id: worshipSession.id },
      { ...dto, inChargeId: inCharge ? inCharge.member.id : undefined },
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(
        WorshipSessionException.UPDATE_ERROR,
      );
    }

    return result;
  }

  async deleteWorshipSession(
    worshipSession: WorshipSessionModel,
    qr?: QueryRunner,
  ) {
    const repository = this.getRepository(qr);

    const result = await repository.softDelete({ id: worshipSession.id });

    if (result.affected === 0) {
      throw new InternalServerErrorException(
        WorshipSessionException.DELETE_ERROR,
      );
    }

    return result;
  }

  async deleteWorshipSessionCascade(
    worship: WorshipModel,
    qr: QueryRunner,
  ): Promise<number[]> {
    const repository = this.getRepository(qr);

    const deletedSessionIds = (
      await repository.find({
        where: {
          worshipId: worship.id,
        },
        select: {
          id: true,
        },
      })
    ).map((session) => session.id);

    await repository.softDelete({
      worshipId: worship.id,
    });

    return deletedSessionIds;
  }

  async countByWorship(worship: WorshipModel): Promise<number> {
    const repository = this.getRepository();

    return repository.count({
      where: {
        worshipId: worship.id,
      },
    });
  }
}
