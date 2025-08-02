import { IEducationTermDomainService } from '../interface/education-term-domain.service.interface';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  EducationTermColumns,
  EducationTermModel,
} from '../../education-term/entity/education-term.entity';
import {
  FindOptionsOrder,
  FindOptionsRelations,
  FindOptionsSelect,
  ILike,
  In,
  QueryRunner,
  Repository,
  UpdateResult,
} from 'typeorm';
import { EducationModel } from '../../education/entity/education.entity';
import { GetEducationTermDto } from '../../education-term/dto/request/get-education-term.dto';
import { CreateEducationTermDto } from '../../education-term/dto/request/create-education-term.dto';
import { UpdateEducationTermDto } from '../../education-term/dto/request/update-education-term.dto';
import { EducationSessionModel } from '../../education-session/entity/education-session.entity';
import { GetInProgressEducationTermDto } from '../../education-term/dto/request/get-in-progress-education-term.dto';
import { ChurchUserModel } from '../../../church-user/entity/church-user.entity';
import { ChurchUserRole } from '../../../user/const/user-role.enum';
import { ChurchModel } from '../../../churches/entity/church.entity';
import {
  MemberSummarizedRelation,
  MemberSummarizedSelect,
} from '../../../members/const/member-find-options.const';
import { EducationTermException } from '../../education-term/exception/education-term.exception';
import { EducationTermStatus } from '../../education-term/const/education-term-status.enum';
import { EducationTermOrder } from '../../education-term/const/education-term-order.enum';
import { EducationEnrollmentStatus } from '../../education-enrollment/const/education-enrollment-status.enum';
import {
  EducationTermRelationOptions,
  EducationTermSelectOptions,
} from '../../education-term/const/education-term-find-options.const';

@Injectable()
export class EducationTermDomainService implements IEducationTermDomainService {
  constructor(
    @InjectRepository(EducationTermModel)
    private readonly educationTermsRepository: Repository<EducationTermModel>,
    @InjectRepository(EducationSessionModel)
    private readonly educationSessionsRepository: Repository<EducationSessionModel>,
  ) {}

  private CountColumnMap = {
    [EducationEnrollmentStatus.COMPLETED]: EducationTermColumns.completedCount,
    [EducationEnrollmentStatus.INCOMPLETE]:
      EducationTermColumns.incompleteCount,
  };

  private getEducationTermsRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(EducationTermModel)
      : this.educationTermsRepository;
  }

  private getEducationSessionRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(EducationSessionModel)
      : this.educationSessionsRepository;
  }

  private assertValidateInChargeMember(member: ChurchUserModel) {
    if (
      member.role !== ChurchUserRole.MANAGER &&
      member.role !== ChurchUserRole.OWNER
    ) {
      throw new ConflictException(
        EducationTermException.INVALID_IN_CHARGE_ROLE,
      );
    }
  }

  private async isExistEducationTerm(
    education: EducationModel,
    term: number,
    qr?: QueryRunner,
  ) {
    const educationTermsRepository = this.getEducationTermsRepository(qr);

    const educationTerm = await educationTermsRepository.findOne({
      where: {
        educationId: education.id,
        term,
      },
    });

    return !!educationTerm;
  }

  private async getTermIdsBySession(
    dto: GetEducationTermDto,
    qr?: QueryRunner,
  ) {
    const educationSessionRepository = this.getEducationSessionRepository(qr);

    const sessions = await educationSessionRepository.find({
      where: {
        inChargeId: dto.sessionInChargeId,
        title: dto.sessionTitle && ILike(`%${dto.sessionTitle}%`),
      },
    });

    return Array.from(
      new Set(sessions.map((session) => session.educationTermId)),
    );
  }

  async findInProgressEducationTerms(
    church: ChurchModel,
    dto: GetInProgressEducationTermDto,
    qr?: QueryRunner,
  ): Promise<EducationTermModel[]> {
    const educationTermsRepository = this.getEducationTermsRepository(qr);

    const order: FindOptionsOrder<EducationTermModel> = {
      [dto.order]: dto.orderDirection,
      id: dto.orderDirection,
    };

    return educationTermsRepository.find({
      where: {
        education: {
          churchId: church.id,
        },
        status: EducationTermStatus.IN_PROGRESS,
      },
      order,
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        educationId: true,
        educationName: true,
        creatorId: true,
        term: true,
        status: true,
        sessionsCount: true,
        startDate: true,
        endDate: true,
        inChargeId: true,
        completedSessionsCount: true,
        enrollmentCount: true,
        //inProgressCount: true,
        completedCount: true,
        incompleteCount: true,
        inCharge: MemberSummarizedSelect,
      },
      relations: {
        inCharge: MemberSummarizedRelation,
      },
      take: dto.take,
      skip: dto.take * (dto.page - 1),
    });
  }

  async findEducationTerms(
    education: EducationModel,
    dto: GetEducationTermDto,
    qr?: QueryRunner,
  ) {
    const educationTermsRepository = this.getEducationTermsRepository(qr);

    const order: FindOptionsOrder<EducationTermModel> = {
      [dto.order]: dto.orderDirection,
      id: dto.orderDirection,
    };

    // 세션명으로 검색 or 세션 담당자로 검색 시
    const termIds =
      dto.sessionInChargeId || dto.sessionTitle
        ? await this.getTermIdsBySession(dto, qr)
        : undefined;

    return educationTermsRepository.find({
      where: {
        id: termIds ? In(termIds) : undefined,
        educationId: education.id,
        inChargeId: dto.termInChargeId,
      },
      order,
      select: EducationTermSelectOptions,
      relations: EducationTermRelationOptions,
      take: dto.take,
      skip: dto.take * (dto.page - 1),
    });
  }

  async findEducationTermById(
    education: EducationModel,
    educationTermId: number,
    qr?: QueryRunner,
  ) {
    const educationTermsRepository = this.getEducationTermsRepository(qr);

    const educationTerm = await educationTermsRepository.findOne({
      where: {
        id: educationTermId,
        educationId: education.id,
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

    if (!educationTerm) {
      throw new NotFoundException(EducationTermException.NOT_FOUND);
    }

    return educationTerm;
  }

  async findEducationTermModelById(
    education: EducationModel,
    educationTermId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<EducationTermModel>,
    selectOptions?: FindOptionsSelect<EducationTermModel>,
  ) {
    const educationTermsRepository = this.getEducationTermsRepository(qr);

    const educationTerm = await educationTermsRepository.findOne({
      where: {
        id: educationTermId,
        educationId: education.id,
      },
      relations: relationOptions,
      select: selectOptions,
    });

    if (!educationTerm) {
      throw new NotFoundException(EducationTermException.NOT_FOUND);
    }

    return educationTerm;
  }

  async createEducationTerm(
    education: EducationModel,
    creator: ChurchUserModel,
    inCharge: ChurchUserModel | null,
    dto: CreateEducationTermDto,
    qr: QueryRunner,
  ): Promise<EducationTermModel> {
    const educationTermsRepository = this.getEducationTermsRepository(qr);

    const isExistTerm = await this.isExistEducationTerm(
      education,
      dto.term,
      qr,
    );

    if (isExistTerm) {
      throw new BadRequestException(EducationTermException.ALREADY_EXIST);
    }

    inCharge && this.assertValidateInChargeMember(inCharge);

    return educationTermsRepository.save({
      educationId: education.id,
      educationName: education.name,
      creatorId: creator.member.id,
      term: dto.term,
      location: dto.location,
      //content: dto.content,
      startDate: dto.utcStartDate,
      endDate: dto.utcEndDate,
      inChargeId: inCharge ? inCharge.member.id : undefined,
    });
  }

  private assertValidateDate(
    dto: UpdateEducationTermDto,
    educationTerm: EducationTermModel,
  ) {
    // 시작일만 수정
    if (dto.utcStartDate && !dto.utcEndDate) {
      if (dto.utcStartDate > educationTerm.endDate) {
        throw new ConflictException(EducationTermException.INVALID_START_DATE);
      }
    }

    // 종료일만 수정
    if (dto.utcEndDate && !dto.utcStartDate) {
      if (educationTerm.startDate > dto.utcEndDate) {
        throw new ConflictException(EducationTermException.INVALID_END_DATE);
      }
    }
  }

  async updateEducationTerm(
    education: EducationModel,
    educationTerm: EducationTermModel,
    newInCharge: ChurchUserModel | null,
    dto: UpdateEducationTermDto,
    qr: QueryRunner,
  ) {
    const educationTermsRepository = this.getEducationTermsRepository(qr);

    this.assertValidateDate(dto, educationTerm);

    if (dto.term) {
      const isExist = await this.isExistEducationTerm(education, dto.term, qr);

      if (isExist) {
        throw new ConflictException(EducationTermException.ALREADY_EXIST);
      }
    }

    newInCharge && this.assertValidateInChargeMember(newInCharge);

    const result = await educationTermsRepository.update(
      {
        id: educationTerm.id,
      },
      {
        term: dto.term,
        location: dto.location,
        status: dto.status,
        startDate: dto.utcStartDate,
        endDate: dto.utcEndDate,
        inChargeId: newInCharge ? newInCharge.member.id : undefined,
      },
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(
        EducationTermException.UPDATE_ERROR,
      );
    }

    return result;
  }

  async deleteEducationTerm(
    educationTerm: EducationTermModel,
    qr?: QueryRunner,
  ) {
    const educationTermsRepository = this.getEducationTermsRepository(qr);

    const result = await educationTermsRepository.softDelete({
      id: educationTerm.id,
    });

    if (result.affected === 0) {
      throw new InternalServerErrorException(
        EducationTermException.DELETE_ERROR,
      );
    }

    return;
  }

  async updateEducationTermName(
    education: EducationModel,
    educationName: string,
    qr: QueryRunner,
  ) {
    const educationTermsRepository = this.getEducationTermsRepository(qr);

    await educationTermsRepository.update(
      {
        educationId: education.id,
      },
      {
        educationName,
      },
    );
  }

  async incrementEnrollmentCount(
    educationTerm: EducationTermModel,
    qr: QueryRunner,
  ) {
    const educationTermsRepository = this.getEducationTermsRepository(qr);

    const result = await educationTermsRepository.increment(
      { id: educationTerm.id },
      EducationTermColumns.enrollmentCount, //'enrollmentCount',
      1,
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(
        EducationTermException.UPDATE_ERROR,
      );
    }

    return result;
  }

  async decrementEnrollmentCount(
    educationTerm: EducationTermModel,
    qr: QueryRunner,
  ) {
    const educationTermsRepository = this.getEducationTermsRepository(qr);

    const result = await educationTermsRepository.decrement(
      { id: educationTerm.id },
      EducationTermColumns.enrollmentCount, //'enrollmentCount',
      1,
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(
        EducationTermException.UPDATE_ERROR,
      );
    }

    return result;
  }

  async incrementEducationStatusCount(
    educationTerm: EducationTermModel,
    status: EducationEnrollmentStatus,
    qr: QueryRunner,
  ) {
    const educationTermsRepository = this.getEducationTermsRepository(qr);

    const result = await educationTermsRepository.increment(
      {
        id: educationTerm.id,
      },
      this.CountColumnMap[status],
      1,
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(
        EducationTermException.UPDATE_ERROR,
      );
    }

    return result;
  }

  async decrementEducationStatusCount(
    educationTerm: EducationTermModel,
    status: EducationEnrollmentStatus,
    qr: QueryRunner,
  ) {
    const educationTermsRepository = this.getEducationTermsRepository(qr);

    const result = await educationTermsRepository.decrement(
      {
        id: educationTerm.id,
      },
      this.CountColumnMap[status],
      1,
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(
        EducationTermException.UPDATE_ERROR,
      );
    }

    return result;
  }

  async incrementNumberOfSessions(
    educationTerm: EducationTermModel,
    qr: QueryRunner,
  ): Promise<UpdateResult> {
    const educationTermsRepository = this.getEducationTermsRepository(qr);
    const result = await educationTermsRepository.increment(
      { id: educationTerm.id },
      EducationTermColumns.sessionsCount,
      1,
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(
        EducationTermException.UPDATE_ERROR,
      );
    }

    return result;
  }

  async decrementNumberOfSessions(
    educationTerm: EducationTermModel,
    qr: QueryRunner,
  ): Promise<UpdateResult> {
    const educationTermsRepository = this.getEducationTermsRepository(qr);
    const result = await educationTermsRepository.decrement(
      { id: educationTerm.id },
      EducationTermColumns.sessionsCount,
      1,
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(
        EducationTermException.UPDATE_ERROR,
      );
    }

    return result;
  }

  async incrementCompletedSessionsCount(
    educationTerm: EducationTermModel,
    qr: QueryRunner,
  ): Promise<UpdateResult> {
    const educationTermRepository = this.getEducationTermsRepository(qr);

    const result = await educationTermRepository.increment(
      { id: educationTerm.id },
      EducationTermColumns.completedSessionsCount,
      1,
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(
        EducationTermException.UPDATE_ERROR,
      );
    }

    return result;
  }

  async decrementCompletedSessionsCount(
    educationTerm: EducationTermModel,
    qr: QueryRunner,
  ): Promise<UpdateResult> {
    const educationTermRepository = this.getEducationTermsRepository(qr);

    const result = await educationTermRepository.decrement(
      { id: educationTerm.id },
      EducationTermColumns.completedSessionsCount,
      1,
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(
        EducationTermException.UPDATE_ERROR,
      );
    }

    return result;
  }
}
