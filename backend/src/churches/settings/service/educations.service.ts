import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { EducationStatus } from '../../members-settings/const/education-status.enum';
import { EducationModel } from '../entity/education/education.entity';
import { GetEducationDto } from '../dto/education/get-education.dto';
import { CreateEducationDto } from '../dto/education/create-education.dto';
import { UpdateEducationDto } from '../dto/education/update-education.dto';
import { EducationException } from '../const/exception/education/education.exception';

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

  getEducations(churchId: number, dto: GetEducationDto, qr?: QueryRunner) {
    const educationsRepository = this.getEducationsRepository(qr);

    return educationsRepository.find({
      where: {
        churchId,
      },
      order: {
        [dto.order]: dto.orderDirection,
        createdAt: dto.orderDirection,
      },
    });
  }

  async isExistEducation(
    churchId: number,
    educationName: string,
    withDeleted: boolean,
    qr?: QueryRunner,
  ) {
    const educationsRepository = this.getEducationsRepository(qr);

    const education = await educationsRepository.findOne({
      where: {
        churchId,
        name: educationName,
      },
      withDeleted,
    });

    return education;
  }

  async createEducation(
    churchId: number,
    dto: CreateEducationDto,
    qr?: QueryRunner,
  ) {
    const educationsRepository = this.getEducationsRepository(qr);

    // 교육 이름 중복 체크
    const existEducation = await this.isExistEducation(
      churchId,
      dto.name,
      false,
      qr,
    );

    if (existEducation) {
      throw new BadRequestException(EducationException.ALREADY_EXIST);
    }

    return educationsRepository.save({
      name: dto.name,
      description: dto.description,
      churchId,
    });
  }

  async updateEducation(
    churchId: number,
    educationId: number,
    dto: UpdateEducationDto,
    qr?: QueryRunner,
  ) {
    const educationsRepository = this.getEducationsRepository(qr);

    const education = await educationsRepository.findOne({
      where: { id: educationId },
    });

    if (!education) {
      throw new NotFoundException(EducationException.NOT_FOUND);
    }

    const existEducation = dto.name
      ? await this.isExistEducation(churchId, dto.name, false, qr)
      : false;

    if (existEducation) {
      if (existEducation.deletedAt !== null) {
        await educationsRepository.delete({ id: existEducation.id });
      } else {
        throw new BadRequestException(EducationException.ALREADY_EXIST);
      }
    }

    await educationsRepository.update(
      {
        id: educationId,
      },
      {
        name: dto.name,
        description: dto.description,
      },
    );

    return educationsRepository.findOne({ where: { id: educationId } });
  }

  async deleteEducation(
    churchId: number,
    educationId: number,
    qr?: QueryRunner,
  ) {
    const educationsRepository = this.getEducationsRepository(qr);

    const result = await educationsRepository.softDelete({ id: educationId });

    if (result.affected === 0) {
      throw new NotFoundException(EducationException.NOT_FOUND);
    }

    return `educationId: ${educationId} deleted`;
  }

  async incrementMemberCount(
    educationId: number,
    status: EducationStatus,
    qr: QueryRunner,
  ) {
    /*const educationsRepository = this.getEducationsRepository(qr);

    const result = await educationsRepository.increment(
      { id: educationId },
      this.CountColumnMap[status],
      1,
    );

    if (result.affected === 0) {
      throw new NotFoundException(SETTING_EXCEPTION.EducationModel.NOT_FOUND);
    }

    return educationsRepository.findOne({ where: { id: educationId } });*/
  }

  async decrementMemberCount(
    educationId: number,
    status: EducationStatus,
    qr: QueryRunner,
  ) {
    /*const educationsRepository = this.getEducationsRepository(qr);

    const result = await educationsRepository.decrement(
      { id: educationId },
      this.CountColumnMap[status],
      1,
    );

    if (result.affected === 0) {
      throw new NotFoundException(SETTING_EXCEPTION.EducationModel.NOT_FOUND);
    }

    return educationsRepository.findOne({ where: { id: educationId } });*/
  }
}
