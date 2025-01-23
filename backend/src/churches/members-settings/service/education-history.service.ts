import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EducationEnrollmentModel } from '../../management/entity/education/education-enrollment.entity';
import { QueryRunner, Repository } from 'typeorm';
import { GetEducationHistoryDto } from '../dto/education/get-education-history.dto';
import { EducationStatus } from '../const/education/education-status.enum';

@Injectable()
export class EducationHistoryService {
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
    memberId: number,
    dto: GetEducationHistoryDto,
    qr?: QueryRunner,
  ) {
    const educationEnrollmentsRepository =
      this.getEducationEnrollmentsRepository(qr);

    const result = await educationEnrollmentsRepository.find({
      where: {
        memberId,
        status: dto.status,
      },
      relations: {
        educationTerm: true,
      },
      order: {
        educationTerm: {
          endDate: dto.orderDirection,
          startDate: dto.orderDirection,
        },
      },
    });

    const totalCount = result.length;
    let inProgressCount = 0;
    let completedCount = 0;
    let incompleteCount = 0;

    result.forEach((enrollment) => {
      if (enrollment.status === EducationStatus.IN_PROGRESS) {
        inProgressCount++;
      } else if (enrollment.status === EducationStatus.COMPLETED) {
        completedCount++;
      } else {
        incompleteCount++;
      }
    });

    return {
      data: result,
      totalCount,
      inProgressCount,
      completedCount,
      incompleteCount,
    };
  }
}
