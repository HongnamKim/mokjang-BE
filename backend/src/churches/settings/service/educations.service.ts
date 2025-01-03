import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EducationModel } from '../entity/education.entity';
import { QueryRunner, Repository } from 'typeorm';
import { EducationStatus } from '../../members-settings/const/education-status.enum';
import { SETTING_EXCEPTION } from '../exception-messages/exception-messages.const';

@Injectable()
export class EducationsService {
  constructor(
    @InjectRepository(EducationModel)
    private readonly educationsRepository: Repository<EducationModel>,
  ) {}

  private CountColumnMap = {
    [EducationStatus.IN_PROGRESS]: 'inProgressCount',
    [EducationStatus.COMPLETED]: 'completedCount',
    [EducationStatus.INCOMPLETE]: 'incompleteCount',
  };

  private getEducationsRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(EducationModel)
      : this.educationsRepository;
  }

  async incrementMemberCount(
    educationId: number,
    status: EducationStatus,
    qr: QueryRunner,
  ) {
    const educationsRepository = this.getEducationsRepository(qr);

    const result = await educationsRepository.increment(
      { id: educationId },
      this.CountColumnMap[status],
      1,
    );

    if (result.affected === 0) {
      throw new NotFoundException(SETTING_EXCEPTION.EducationModel.NOT_FOUND);
    }

    return educationsRepository.findOne({ where: { id: educationId } });
  }

  async decrementMemberCount(
    educationId: number,
    status: EducationStatus,
    qr: QueryRunner,
  ) {
    const educationsRepository = this.getEducationsRepository(qr);

    const result = await educationsRepository.decrement(
      { id: educationId },
      this.CountColumnMap[status],
      1,
    );

    if (result.affected === 0) {
      throw new NotFoundException(SETTING_EXCEPTION.EducationModel.NOT_FOUND);
    }

    return educationsRepository.findOne({ where: { id: educationId } });
  }
}
