import { IEducationTermDomainService } from '../interface/education-term-domain.service.interface';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EducationTermModel } from '../../../entity/education-term.entity';
import {
  FindOptionsRelations,
  FindOptionsSelect,
  QueryRunner,
  Repository,
  UpdateResult,
} from 'typeorm';
import { ChurchModel } from '../../../../../churches/entity/church.entity';
import { EducationModel } from '../../../entity/education.entity';
import { GetEducationTermDto } from '../../../dto/terms/get-education-term.dto';
import { EducationTermOrderEnum } from '../../../const/order.enum';
import { EducationTermPaginationResultDto } from '../../../dto/education-term-pagination-result.dto';
import { EducationTermException } from '../../../const/exception/education.exception';
import { CreateEducationTermDto } from '../../../dto/terms/create-education-term.dto';
import { UpdateEducationTermDto } from '../../../dto/terms/update-education-term.dto';
import { EducationEnrollmentModel } from '../../../entity/education-enrollment.entity';
import { EducationStatus } from '../../../const/education-status.enum';
import { MemberModel } from '../../../../../members/entity/member.entity';

@Injectable()
export class EducationTermDomainService implements IEducationTermDomainService {
  constructor(
    @InjectRepository(EducationTermModel)
    private readonly educationTermsRepository: Repository<EducationTermModel>,
  ) {}

  private CountColumnMap = {
    [EducationStatus.IN_PROGRESS]: 'inProgressCount',
    [EducationStatus.COMPLETED]: 'completedCount',
    [EducationStatus.INCOMPLETE]: 'incompleteCount',
  };

  private getEducationTermsRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(EducationTermModel)
      : this.educationTermsRepository;
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

  async findEducationTerms(
    church: ChurchModel,
    education: EducationModel,
    dto: GetEducationTermDto,
    qr?: QueryRunner,
  ): Promise<EducationTermPaginationResultDto> {
    const educationTermsRepository = this.getEducationTermsRepository(qr);

    const order: Partial<
      Record<EducationTermOrderEnum, 'asc' | 'desc' | 'ASC' | 'DESC'>
    > = {
      [dto.order]: dto.orderDirection,
    };

    if (dto.order !== EducationTermOrderEnum.createdAt) {
      order.createdAt = 'desc';
    }

    const [result, totalCount] = await Promise.all([
      educationTermsRepository.find({
        where: {
          education: {
            churchId: church.id,
          },
          educationId: education.id,
        },
        order,
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
            churchId: church.id,
          },
          educationId: education.id,
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
        instructor: {
          group: true,
          groupRole: true,
          officer: true,
        },
        //educationSessions: true,
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
    church: ChurchModel,
    education: EducationModel,
    instructor: MemberModel | null,
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

    return educationTermsRepository.save({
      educationId: education.id,
      educationName: education.name,
      ...dto,
      instructorId: instructor ? instructor.id : undefined,
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
    }

    // 시작일만 수정
    if (dto.startDate && !dto.endDate) {
      if (dto.startDate > educationTerm.endDate) {
        throw new BadRequestException(
          EducationTermException.INVALID_START_DATE,
        );
      }
    }

    // 종료일만 수정
    if (dto.endDate && !dto.startDate) {
      if (educationTerm.startDate > dto.endDate) {
        throw new BadRequestException(EducationTermException.INVALID_END_DATE);
      }
    }
  }

  async updateEducationTerm(
    education: EducationModel,
    educationTerm: EducationTermModel & {
      educationEnrollments: EducationEnrollmentModel[];
    },
    newInstructor: MemberModel | null,
    dto: UpdateEducationTermDto,
    qr: QueryRunner,
  ) {
    const educationTermsRepository = this.getEducationTermsRepository(qr);

    this.validateUpdateEducationTerm(dto, educationTerm);

    if (dto.term) {
      const isExist = await this.isExistEducationTerm(education, dto.term, qr);

      if (isExist) {
        throw new BadRequestException(EducationTermException.ALREADY_EXIST);
      }
    }

    const result = await educationTermsRepository.update(
      {
        id: educationTerm.id,
      },
      {
        ...dto,
        instructorId: newInstructor ? newInstructor.id : undefined,
      },
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(
        EducationTermException.UPDATE_ERROR,
      );
    }

    const updatedEducation = await educationTermsRepository.findOne({
      where: {
        id: educationTerm.id,
      },
      relations: {
        instructor: {
          group: true,
          groupRole: true,
          officer: true,
        },
      },
    });

    if (!updatedEducation) {
      throw new InternalServerErrorException(
        EducationTermException.UPDATE_ERROR,
      );
    }

    return updatedEducation;
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

    return `educationTermId: ${educationTerm.id} deleted`;
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
      'enrollmentCount',
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
      'enrollmentCount',
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
    status: EducationStatus,
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
    status: EducationStatus,
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
      'numberOfSessions',
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
      'numberOfSessions',
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
      'isDoneCount',
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
      'isDoneCount',
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
