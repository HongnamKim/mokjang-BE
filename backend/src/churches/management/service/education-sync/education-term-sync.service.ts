import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EducationModel } from '../../entity/education/education.entity';
import { QueryRunner, Repository } from 'typeorm';
import { EducationTermModel } from '../../entity/education/education-term.entity';
import { EducationException } from '../../const/exception/education/education.exception';

@Injectable()
export class EducationTermSyncService {
  constructor(
    @InjectRepository(EducationModel)
    private readonly educationRepository: Repository<EducationModel>,
    @InjectRepository(EducationTermModel)
    private readonly educationTermRepository: Repository<EducationTermModel>,
  ) {}

  private getEducationRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(EducationModel)
      : this.educationRepository;
  }

  private getEducationTermRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(EducationTermModel)
      : this.educationTermRepository;
  }

  syncEducationName(
    educationId: number,
    educationName: string,
    qr: QueryRunner,
  ) {
    const educationTermRepository =
      qr.manager.getRepository(EducationTermModel);

    return educationTermRepository.update({ educationId }, { educationName });
  }

  async getEducationModelById(
    churchId: number,
    educationId: number,
    qr?: QueryRunner,
  ) {
    const educationsRepository = this.getEducationRepository(qr);

    const education = await educationsRepository.findOne({
      where: {
        id: educationId,
        churchId,
      },
    });

    if (!education) {
      throw new NotFoundException(EducationException.NOT_FOUND);
    }

    return education;
  }
}
