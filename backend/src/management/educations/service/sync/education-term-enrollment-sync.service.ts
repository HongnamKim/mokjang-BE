import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EducationTermModel } from '../../../entity/education/education-term.entity';
import { QueryRunner, Repository } from 'typeorm';
import { EducationEnrollmentModel } from '../../../entity/education/education-enrollment.entity';
import { EducationStatus } from '../../const/education-status.enum';

@Injectable()
export class EducationTermEnrollmentSyncService {
  constructor(
    @InjectRepository(EducationTermModel)
    private readonly educationTermRepository: Repository<EducationTermModel>,
    @InjectRepository(EducationEnrollmentModel)
    private readonly educationEnrollmentRepository: Repository<EducationEnrollmentModel>,
  ) {}

  private CountColumnMap = {
    [EducationStatus.IN_PROGRESS]: 'inProgressCount',
    [EducationStatus.COMPLETED]: 'completedCount',
    [EducationStatus.INCOMPLETE]: 'incompleteCount',
  };

  private getEducationTermRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(EducationTermModel)
      : this.educationTermRepository;
  }

  private getEducationEnrollmentRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(EducationEnrollmentModel)
      : this.educationEnrollmentRepository;
  }

  async getEducationTermModelById(
    churchId: number,
    educationId: number,
    educationTermId: number,
    qr: QueryRunner,
  ) {
    const educationTermRepository = this.getEducationTermRepository(qr);

    const educationTerm = await educationTermRepository.findOne({
      where: {
        id: educationTermId,
        educationId,
        education: {
          churchId,
        },
      },
      relations: {
        //instructor: true,
        educationSessions: true,
      },
    });

    if (!educationTerm) {
      throw new NotFoundException('해당 교육 기수를 찾을 수 없습니다.');
    }

    return educationTerm;
  }

  async incrementEnrollmentCount(educationTermId: number, qr: QueryRunner) {
    const educationTermsRepository = this.getEducationTermRepository(qr);

    const result = await educationTermsRepository.increment(
      { id: educationTermId },
      'enrollmentCount',
      1,
    );

    if (result.affected === 0) {
      throw new NotFoundException('해당 교육 기수를 찾을 수 없습니다.');
    }

    return result;
  }

  async decrementEnrollmentCount(educationTermId: number, qr: QueryRunner) {
    const educationTermsRepository = this.getEducationTermRepository(qr);

    const result = await educationTermsRepository.decrement(
      { id: educationTermId },
      'enrollmentCount',
      1,
    );

    if (result.affected === 0) {
      throw new NotFoundException('해당 교육 기수를 찾을 수 없습니다.');
    }

    return result;
  }

  async incrementEducationStatusCount(
    educationTermId: number,
    status: EducationStatus,
    qr: QueryRunner,
  ) {
    const educationTermsRepository = this.getEducationTermRepository(qr);

    const result = await educationTermsRepository.increment(
      {
        id: educationTermId,
      },
      this.CountColumnMap[status],
      1,
    );

    if (result.affected === 0) {
      throw new NotFoundException('해당 교육 기수를 찾을 수 없습니다.');
    }

    return result;
  }

  async decrementEducationStatusCount(
    educationTermId: number,
    status: EducationStatus,
    qr: QueryRunner,
  ) {
    const educationTermsRepository = this.getEducationTermRepository(qr);

    const result = await educationTermsRepository.decrement(
      {
        id: educationTermId,
      },
      this.CountColumnMap[status],
      1,
    );

    if (result.affected === 0) {
      throw new NotFoundException('해당 교육 기수를 찾을 수 없습니다.');
    }

    return result;
  }
}
