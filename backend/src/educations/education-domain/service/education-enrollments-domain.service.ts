import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { IEducationEnrollmentsDomainService } from '../interface/education-enrollment-domain.service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { EducationEnrollmentModel } from '../../education-enrollment/entity/education-enrollment.entity';
import {
  FindOptionsOrder,
  FindOptionsRelations,
  ILike,
  In,
  IsNull,
  QueryRunner,
  Repository,
  UpdateResult,
} from 'typeorm';
import { EducationTermModel } from '../../education-term/entity/education-term.entity';
import { GetEducationEnrollmentDto } from '../../education-enrollment/dto/request/get-education-enrollment.dto';
import { MemberModel } from '../../../members/entity/member.entity';
import { EducationException } from '../../education/exception/education.exception';
import {
  MemberSummarizedRelation,
  MemberSummarizedSelect,
} from '../../../members/const/member-find-options.const';
import { EducationEnrollmentException } from '../../education-enrollment/exception/education-enrollment.exception';
import { EducationEnrollmentStatus } from '../../education-enrollment/const/education-enrollment-status.enum';
import { EducationEnrollmentOrder } from '../../education-enrollment/const/education-enrollment-order.enum';

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
    members: MemberModel[],
    qr?: QueryRunner,
  ) {
    const educationEnrollmentsRepository =
      this.getEducationEnrollmentsRepository(qr);

    const memberIds = members.map((member) => member.id);

    const enrollment = await educationEnrollmentsRepository.find({
      where: {
        educationTermId: educationTerm.id,
        memberId: In(memberIds),
      },
    });

    return enrollment.length > 0;
  }

  async findEducationEnrollments(
    educationTerm: EducationTermModel,
    dto: GetEducationEnrollmentDto,
    qr?: QueryRunner,
  ) {
    const educationEnrollmentsRepository =
      this.getEducationEnrollmentsRepository(qr);

    const order: FindOptionsOrder<EducationEnrollmentModel> =
      dto.order !== EducationEnrollmentOrder.NAME
        ? {
            [dto.order]: dto.orderDirection,
            id: dto.orderDirection,
          }
        : {
            member: {
              name: dto.orderDirection,
            },
            id: dto.orderDirection,
          };

    return educationEnrollmentsRepository.find({
      where: {
        educationTermId: educationTerm.id,
        member: {
          name: dto.memberName && ILike(`%${dto.memberName}%`),
        },
        status: dto.status,
      },
      relations: {
        member: MemberSummarizedRelation,
      },
      select: {
        member: MemberSummarizedSelect,
      },
      order,
      take: dto.take,
      skip: dto.take * (dto.page - 1),
    });
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

  async findEducationEnrollmentsByMemberId(memberId: number, qr?: QueryRunner) {
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
        member: MemberSummarizedRelation,
      },
      select: {
        member: MemberSummarizedSelect,
      },
    });

    if (!enrollment) {
      throw new NotFoundException(EducationEnrollmentException.NOT_FOUND);
    }

    return enrollment;
  }

  async findEducationEnrollmentsByIds(
    educationTerm: EducationTermModel,
    ids: number[],
    qr?: QueryRunner,
  ) {
    const educationEnrollmentsRepository =
      this.getEducationEnrollmentsRepository(qr);

    return educationEnrollmentsRepository.find({
      where: {
        educationTermId: educationTerm.id,
        id: In(ids),
      },
      relations: {
        member: MemberSummarizedRelation,
      },
      select: {
        member: MemberSummarizedSelect,
      },
    });
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
    members: MemberModel[],
    qr: QueryRunner,
  ): Promise<EducationEnrollmentModel[]> {
    const repository = this.getEducationEnrollmentsRepository(qr);

    const isExistEnrollment = await this.isExistEnrollment(
      educationTerm,
      members,
      qr,
    );

    if (isExistEnrollment) {
      throw new ConflictException(EducationEnrollmentException.ALREADY_EXIST);
    }

    const enrollments = repository.create(
      members.map((member) => ({
        educationTermId: educationTerm.id,
        memberId: member.id,
        status: EducationEnrollmentStatus.INCOMPLETE,
      })),
    );

    return repository.save(enrollments);
  }

  async updateEducationEnrollment(
    educationEnrollment: EducationEnrollmentModel,
    status: EducationEnrollmentStatus,
    qr: QueryRunner,
  ) {
    const educationEnrollmentsRepository =
      this.getEducationEnrollmentsRepository(qr);

    const result = await educationEnrollmentsRepository.update(
      {
        id: educationEnrollment.id,
      },
      {
        status,
      },
    );

    if (result.affected === 0) {
      throw new InternalServerErrorException(
        EducationEnrollmentException.UPDATE_ERROR,
      );
    }

    return result;
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

  async bulkIncrementAttendanceCount(
    educationEnrollments: EducationEnrollmentModel[],
    qr: QueryRunner,
  ): Promise<UpdateResult> {
    const repository = this.getEducationEnrollmentsRepository(qr);

    const enrollmentIds = educationEnrollments.map(
      (educationEnrollment) => educationEnrollment.id,
    );

    const result = await repository.increment(
      {
        id: In(enrollmentIds),
      },
      'attendancesCount',
      1,
    );

    if (result.affected !== educationEnrollments.length) {
      throw new InternalServerErrorException(
        EducationEnrollmentException.UPDATE_ERROR,
      );
    }

    return result;
  }

  async incrementAttendanceCount(
    educationEnrollment: EducationEnrollmentModel,
    qr: QueryRunner,
  ) {
    const educationEnrollmentsRepository =
      this.getEducationEnrollmentsRepository(qr);

    const result = await educationEnrollmentsRepository.increment(
      { id: educationEnrollment.id, deletedAt: IsNull() },
      'attendancesCount',
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
      'attendancesCount',
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
      'attendancesCount',
      1,
    );
  }
}
