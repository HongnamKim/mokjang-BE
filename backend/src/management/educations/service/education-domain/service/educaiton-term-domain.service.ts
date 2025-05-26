import { IEducationTermDomainService } from '../interface/education-term-domain.service.interface';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  EducationTermColumns,
  EducationTermModel,
} from '../../../entity/education-term.entity';
import {
  FindOptionsRelations,
  FindOptionsSelect,
  ILike,
  In,
  QueryRunner,
  Repository,
  UpdateResult,
} from 'typeorm';
import { ChurchModel } from '../../../../../churches/entity/church.entity';
import { EducationModel } from '../../../entity/education.entity';
import { GetEducationTermDto } from '../../../dto/terms/request/get-education-term.dto';
import { EducationTermOrderEnum } from '../../../const/order.enum';
import { EducationTermException } from '../../../const/exception/education.exception';
import { CreateEducationTermDto } from '../../../dto/terms/request/create-education-term.dto';
import { UpdateEducationTermDto } from '../../../dto/terms/request/update-education-term.dto';
import { EducationEnrollmentStatus } from '../../../const/education-status.enum';
import { MemberModel } from '../../../../../members/entity/member.entity';
import {
  MemberSummarizedRelation,
  MemberSummarizedSelect,
} from '../../../../../members/const/member-find-options.const';
import { UserRole } from '../../../../../user/const/user-role.enum';
import { MemberException } from '../../../../../members/const/exception/member.exception';
import { EducationSessionModel } from '../../../entity/education-session.entity';

@Injectable()
export class EducationTermDomainService implements IEducationTermDomainService {
  constructor(
    @InjectRepository(EducationTermModel)
    private readonly educationTermsRepository: Repository<EducationTermModel>,
    @InjectRepository(EducationSessionModel)
    private readonly educationSessionsRepository: Repository<EducationSessionModel>,
  ) {}

  private CountColumnMap = {
    [EducationEnrollmentStatus.IN_PROGRESS]:
      EducationTermColumns.inProgressCount, //'inProgressCount',
    [EducationEnrollmentStatus.COMPLETED]: EducationTermColumns.completedCount, //'completedCount',
    [EducationEnrollmentStatus.INCOMPLETE]:
      EducationTermColumns.incompleteCount, //'incompleteCount',
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

  private assertValidateInChargeMember(member: MemberModel) {
    if (!member.userId) {
      throw new UnauthorizedException(
        EducationTermException.UNLINKED_IN_CHARGE,
      );
    }

    if (member.userId && !member.user) {
      throw new InternalServerErrorException(MemberException.USER_ERROR);
    }

    if (
      member.user.role !== UserRole.manager &&
      member.user.role !== UserRole.mainAdmin
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

  async findEducationTerms(
    church: ChurchModel,
    education: EducationModel,
    dto: GetEducationTermDto,
    qr?: QueryRunner,
  ) {
    const educationTermsRepository = this.getEducationTermsRepository(qr);

    const order: Partial<
      Record<EducationTermOrderEnum, 'asc' | 'desc' | 'ASC' | 'DESC'>
    > = {
      [dto.order]: dto.orderDirection,
    };

    if (dto.order !== EducationTermOrderEnum.createdAt) {
      order.createdAt = 'desc';
    }

    const termIds =
      dto.sessionInChargeId || dto.sessionTitle
        ? await this.getTermIdsBySession(dto, qr)
        : undefined;

    const [result, totalCount] = await Promise.all([
      educationTermsRepository.find({
        where: {
          id: termIds ? In(termIds) : undefined,
          education: {
            churchId: church.id,
          },
          educationId: education.id,
          inChargeId: dto.termInChargeId,
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
          numberOfSessions: true,
          startDate: true,
          endDate: true,
          inChargeId: true,
          isDoneCount: true,
          enrollmentCount: true,
          inProgressCount: true,
          completedCount: true,
          incompleteCount: true,
          inCharge: MemberSummarizedSelect,
        },
        relations: {
          inCharge: MemberSummarizedRelation,
        },
        take: dto.take,
        skip: dto.take * (dto.page - 1),
      }),
      educationTermsRepository.count({
        where: {
          id: termIds ? In(termIds) : undefined,
          education: {
            churchId: church.id,
          },
          educationId: education.id,
          inChargeId: dto.termInChargeId,
        },
      }),
    ]);

    return {
      data: result,
      totalCount,
    };
  }

  async findEducationTermById(
    church: ChurchModel,
    education: EducationModel,
    educationTermId: number,
    qr?: QueryRunner,
  ) {
    const educationTermsRepository = this.getEducationTermsRepository(qr);

    const educationTerm = await educationTermsRepository.findOne({
      where: {
        id: educationTermId,
        educationId: education.id,
        education: {
          churchId: church.id,
        },
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
    church: ChurchModel,
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
        education: {
          churchId: church.id,
        },
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
    creator: MemberModel,
    inCharge: MemberModel | null,
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
      creatorId: creator.id,
      ...dto,
      inChargeId: inCharge ? inCharge.id : undefined,
    });
  }

  private assertValidateDate(
    dto: UpdateEducationTermDto,
    educationTerm: EducationTermModel,
  ) {
    // 시작일만 수정
    if (dto.startDate && !dto.endDate) {
      if (dto.startDate > educationTerm.endDate) {
        throw new ConflictException(EducationTermException.INVALID_START_DATE);
      }
    }

    // 종료일만 수정
    if (dto.endDate && !dto.startDate) {
      if (educationTerm.startDate > dto.endDate) {
        throw new ConflictException(EducationTermException.INVALID_END_DATE);
      }
    }

    /*
    // 회자만 수정
    if (dto.numberOfSessions && !dto.completionCriteria) {
      if (
        educationTerm.completionCriteria &&
        dto.numberOfSessions < educationTerm.completionCriteria
      ) {
        throw new BadRequestException(
          EducationTermException.INVALID_NUMBER_OF_SESSION,
        );
      }
    }

    // 이수 조건만 수정
    if (dto.completionCriteria && !dto.numberOfSessions) {
      if (dto.completionCriteria > educationTerm.numberOfSessions) {
        throw new BadRequestException(
          EducationTermException.INVALID_NUMBER_OF_CRITERIA,
        );
      }
    }*/
  }

  async updateEducationTerm(
    education: EducationModel,
    educationTerm: EducationTermModel,
    newInCharge: MemberModel | null,
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
        ...dto,
        inChargeId: newInCharge ? newInCharge.id : undefined,
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
      EducationTermColumns.numberOfSessions, //'numberOfSessions',
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
      EducationTermColumns.numberOfSessions, //'numberOfSessions',
      1,
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(
        EducationTermException.UPDATE_ERROR,
      );
    }

    return result;
  }

  async incrementDoneCount(
    educationTerm: EducationTermModel,
    qr: QueryRunner,
  ): Promise<UpdateResult> {
    const educationTermRepository = this.getEducationTermsRepository(qr);

    const result = await educationTermRepository.increment(
      { id: educationTerm.id },
      EducationTermColumns.isDoneCount, //'isDoneCount',
      1,
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(
        EducationTermException.UPDATE_ERROR,
      );
    }

    return result;
  }

  async decrementDoneCount(
    educationTerm: EducationTermModel,
    qr: QueryRunner,
  ): Promise<UpdateResult> {
    const educationTermRepository = this.getEducationTermsRepository(qr);

    const result = await educationTermRepository.decrement(
      { id: educationTerm.id },
      EducationTermColumns.isDoneCount, //'isDoneCount',
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
