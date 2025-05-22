import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { IEducationEnrollmentsDomainService } from '../interface/education-enrollment-domain.service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { EducationEnrollmentModel } from '../../../entity/education-enrollment.entity';
import {
  FindOptionsRelations,
  ILike,
  In,
  IsNull,
  QueryRunner,
  Repository,
} from 'typeorm';
import { EducationTermModel } from '../../../entity/education-term.entity';
import { GetEducationEnrollmentDto } from '../../../dto/enrollments/get-education-enrollment.dto';
import { EducationEnrollmentOrderEnum } from '../../../const/order.enum';
import {
  EducationEnrollmentException,
  EducationException,
} from '../../../const/exception/education.exception';
import { CreateEducationEnrollmentDto } from '../../../dto/enrollments/create-education-enrollment.dto';
import { UpdateEducationEnrollmentDto } from '../../../dto/enrollments/update-education-enrollment.dto';
import { MemberModel } from '../../../../../members/entity/member.entity';
import {
  DefaultMemberRelationOptions,
  DefaultMemberSelectOptions,
} from '../../../const/instructor-find-options.const';

@Injectable()
export class EducationEnrollmentsDomainService
  implements IEducationEnrollmentsDomainService
{
  constructor(
    @InjectRepository(EducationEnrollmentModel)
    private readonly educationEnrollmentsRepository: Repository<EducationEnrollmentModel>,
  ) {}

  private getEducationEnrollmentsRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(EducationEnrollmentModel)
      : this.educationEnrollmentsRepository;
  }

  private async isExistEnrollment(
    educationTerm: EducationTermModel,
    member: MemberModel,
    qr?: QueryRunner,
  ) {
    const educationEnrollmentsRepository =
      this.getEducationEnrollmentsRepository(qr);

    const enrollment = await educationEnrollmentsRepository.findOne({
      where: {
        educationTermId: educationTerm.id,
        memberId: member.id,
      },
    });

    return !!enrollment;
  }

  async findEducationEnrollments(
    educationTerm: EducationTermModel,
    dto: GetEducationEnrollmentDto,
    qr?: QueryRunner,
  ) {
    const educationEnrollmentsRepository =
      this.getEducationEnrollmentsRepository(qr);

    const order: Partial<
      Record<EducationEnrollmentOrderEnum, 'asc' | 'desc' | 'ASC' | 'DESC'>
    > = {
      [dto.order]: dto.orderDirection,
    };

    if (dto.order !== EducationEnrollmentOrderEnum.createdAt) {
      order.createdAt = 'desc';
    }

    const [result, totalCount] = await Promise.all([
      educationEnrollmentsRepository.find({
        where: {
          educationTermId: educationTerm.id,
          member: {
            name: dto.memberName && ILike(`%${dto.memberName}%`),
          },
        },
        relations: {
          member: DefaultMemberRelationOptions,
        },
        select: {
          member: DefaultMemberSelectOptions,
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
          educationTermId: educationTerm.id,
          member: {
            name: dto.memberName && ILike(`%${dto.memberName}%`),
          },
        },
      }),
    ]);

    return {
      data: result,
      totalCount,
    };
  }

  findEducationEnrollmentModels(
    educationTerm: EducationTermModel,
    qr?: QueryRunner,
  ): Promise<EducationEnrollmentModel[]> {
    const repository = this.getEducationEnrollmentsRepository(qr);

    return repository.find({
      where: {
        educationTermId: educationTerm.id,
      },
    });
  }

  async findMemberEducationEnrollments(memberId: number, qr?: QueryRunner) {
    const educationEnrollmentsRepository =
      this.getEducationEnrollmentsRepository(qr);

    return await educationEnrollmentsRepository.find({
      where: {
        memberId: memberId,
      },
      relations: {
        educationTerm: true,
      },
    });
  }

  async findEducationEnrollmentById(
    educationTerm: EducationTermModel,
    educationEnrollmentId: number,
    qr?: QueryRunner,
  ) {
    const educationEnrollmentsRepository =
      this.getEducationEnrollmentsRepository(qr);

    const enrollment = await educationEnrollmentsRepository.findOne({
      where: {
        educationTermId: educationTerm.id,
        id: educationEnrollmentId,
      },
      relations: {
        member: DefaultMemberRelationOptions,
      },
      select: {
        member: DefaultMemberSelectOptions,
      },
    });

    if (!enrollment) {
      throw new NotFoundException(EducationEnrollmentException.NOT_FOUND);
    }

    return enrollment;
  }

  async findEducationEnrollmentModelById(
    educationEnrollmentId: number,
    qr?: QueryRunner,
    relationOptions?: FindOptionsRelations<EducationEnrollmentModel>,
  ) {
    const educationEnrollmentsRepository =
      this.getEducationEnrollmentsRepository(qr);

    const enrollment = await educationEnrollmentsRepository.findOne({
      where: {
        id: educationEnrollmentId,
      },
      relations: relationOptions,
    });

    if (!enrollment) {
      throw new NotFoundException(EducationEnrollmentException.NOT_FOUND);
    }

    return enrollment;
  }

  async createEducationEnrollment(
    educationTerm: EducationTermModel,
    member: MemberModel,
    dto: CreateEducationEnrollmentDto,
    qr: QueryRunner,
  ): Promise<EducationEnrollmentModel> {
    const educationEnrollmentsRepository =
      this.getEducationEnrollmentsRepository(qr);

    const isExistEnrollment = await this.isExistEnrollment(
      educationTerm,
      member,
      qr,
    );

    if (isExistEnrollment) {
      throw new ConflictException(EducationEnrollmentException.ALREADY_EXIST);
    }

    return educationEnrollmentsRepository.save({
      member,
      educationTerm,
      status: dto.status,
      note: dto.note,
    });
  }

  async updateEducationEnrollment(
    educationEnrollment: EducationEnrollmentModel,
    dto: UpdateEducationEnrollmentDto,
    qr: QueryRunner,
  ) {
    const educationEnrollmentsRepository =
      this.getEducationEnrollmentsRepository(qr);

    await educationEnrollmentsRepository.update(
      {
        id: educationEnrollment.id,
      },
      {
        status: dto.status,
        note: dto.note,
      },
    );

    const updated = await educationEnrollmentsRepository.findOne({
      where: {
        id: educationEnrollment.id,
      },
      relations: {
        member: {
          group: true,
          groupRole: true,
          officer: true,
        },
      },
    });

    if (!updated) {
      throw new InternalServerErrorException(
        EducationEnrollmentException.UPDATE_ERROR,
      );
    }

    return updated;
  }

  async deleteEducationEnrollment(
    educationEnrollment: EducationEnrollmentModel,
    qr: QueryRunner,
  ) {
    const educationEnrollmentsRepository =
      this.getEducationEnrollmentsRepository(qr);

    await educationEnrollmentsRepository.softDelete({
      id: educationEnrollment.id,
    });

    return `educationEnrollment: ${educationEnrollment.id} deleted`;
  }

  async deleteEducationEnrollmentsCascade(
    educationTerm: EducationTermModel,
    qr: QueryRunner,
  ): Promise<void> {
    const repository = this.getEducationEnrollmentsRepository(qr);

    await repository.softDelete({
      educationTermId: educationTerm.id,
    });

    return;
  }

  async incrementAttendanceCount(
    educationEnrollment: EducationEnrollmentModel,
    qr: QueryRunner,
  ) {
    const educationEnrollmentsRepository =
      this.getEducationEnrollmentsRepository(qr);

    const result = await educationEnrollmentsRepository.increment(
      { id: educationEnrollment.id, deletedAt: IsNull() },
      'attendanceCount',
      1,
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(EducationException.UPDATE_ERROR);
    }

    return result;
  }

  async decrementAttendanceCount(
    educationEnrollment: EducationEnrollmentModel,
    qr: QueryRunner,
  ) {
    const educationEnrollmentsRepository =
      this.getEducationEnrollmentsRepository(qr);

    const result = await educationEnrollmentsRepository.decrement(
      { id: educationEnrollment.id, deletedAt: IsNull() },
      'attendanceCount',
      1,
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(EducationException.UPDATE_ERROR);
    }

    return result;
  }

  async decrementAttendanceCountBySessionDeletion(
    attendedEnrollmentIds: number[],
    qr: QueryRunner,
  ) {
    const educationEnrollmentsRepository =
      this.getEducationEnrollmentsRepository(qr);

    await educationEnrollmentsRepository.decrement(
      { id: In(attendedEnrollmentIds) },
      'attendanceCount',
      1,
    );
  }
}
