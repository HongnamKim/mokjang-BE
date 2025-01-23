import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EducationEnrollmentModel } from '../../management/entity/education/education-enrollment.entity';
import { FindOptionsWhere, QueryRunner, Repository } from 'typeorm';
import { GetEducationHistoryDto } from '../dto/education/get-education-history.dto';
import { EducationStatus } from '../../management/const/education/education-status.enum';

@Injectable()
export class MemberEducationService {
  constructor(
    @InjectRepository(EducationEnrollmentModel)
    private readonly educationEnrollmentsRepository: Repository<EducationEnrollmentModel>,
  ) {}

  private getEducationEnrollmentsRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(EducationEnrollmentModel)
      : this.educationEnrollmentsRepository;
  }

  async getMemberEducationEnrollments(
    churchId: number,
    memberId: number,
    dto: GetEducationHistoryDto,
    qr?: QueryRunner,
  ) {
    const educationEnrollmentsRepository =
      this.getEducationEnrollmentsRepository(qr);

    const findOptionsWhere: FindOptionsWhere<EducationEnrollmentModel> = {
      member: {
        churchId,
      },
      memberId,
      status: dto.status,
    };

    const [result, totalCount] = await Promise.all([
      educationEnrollmentsRepository.find({
        where: findOptionsWhere,
        relations: {
          educationTerm: true,
        },
        order: {
          educationTerm: {
            endDate: dto.orderDirection,
            startDate: dto.orderDirection,
          },
        },
        take: dto.take,
        skip: dto.take * (dto.page - 1),
      }),
      educationEnrollmentsRepository.count({
        where: findOptionsWhere,
      }),
    ]);

    return {
      data: result,
      totalCount,
      count: result.length,
      page: dto.page,
      ...this.getEducationStatusCount(result),
    };
  }

  private getEducationStatusCount(enrollments: EducationEnrollmentModel[]) {
    return enrollments.reduce(
      (acc, enrollment) => ({
        inProgressCount:
          acc.inProgressCount +
          (enrollment.status === EducationStatus.IN_PROGRESS ? 1 : 0),
        completedCount:
          acc.completedCount +
          (enrollment.status === EducationStatus.COMPLETED ? 1 : 0),
        incompleteCount:
          acc.incompleteCount +
          (enrollment.status === EducationStatus.INCOMPLETE ? 1 : 0),
      }),
      { inProgressCount: 0, completedCount: 0, incompleteCount: 0 },
    );
  }
}
